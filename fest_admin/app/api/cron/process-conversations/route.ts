import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { analyzeConversation } from "@/lib/gemini";

// Disable route response caching
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const processedLogs: any[] = [];
  try {
    // 1. Authorization check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === "development";

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isDev) {
      console.warn("Unauthorized request attempt to conversation cron job.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch conversations that are pending AI response
    // Model field is spelling: control_over (ConversarionControl enum values: AI, HUMAN)
    const pendingConversations = await prisma.conversations.findMany({
      where: {
        pending: true,
        control_over: "AI",
      },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (pendingConversations.length === 0) {
      return NextResponse.json({ message: "No pending AI conversations to process." });
    }

    console.log(`Processing ${pendingConversations.length} pending conversations...`);

    // 3. Process each conversation in isolation
    for (const conversation of pendingConversations) {
      try {
        const phone = conversation.phone_number;

        // Fetch latest purchase and associated tickets
        const latestPurchase = await prisma.purchases.findFirst({
          where: { conversation_id: conversation.id },
          orderBy: { created_at: "desc" },
          include: {
            tickets: true,
          },
        });

        // Format purchase context for Gemini
        let purchaseInfo = "No hay compras registradas para esta conversación.";
        if (latestPurchase) {
          purchaseInfo = `Compra ID: ${latestPurchase.id}
Estado de la compra: ${latestPurchase.state || "PENDING"}
Monto Total: ${latestPurchase.total_amount ? Number(latestPurchase.total_amount) : 0}
Monto Pagado: ${latestPurchase.paid_amount ? Number(latestPurchase.paid_amount) : 0}
Tickets/Entradas creadas para esta compra:
${
  latestPurchase.tickets.length > 0
    ? latestPurchase.tickets
        .map(
          (t) =>
            `- Ticket ID: ${t.id}, Nombre: ${t.first_name} ${t.last_name}, Género: ${
              t.gender || "No especificado"
            }, Estado Pago: ${t.payment_state ? "Pagado (OK)" : "Pendiente de pago"}`
        )
        .join("\n")
    : "Ninguna entrada creada aún."
}`;
        }

        // Call Gemini for analysis using the conversation's buffer directly
        const analysis = await analyzeConversation(
          phone,
          conversation.state || "IDLE",
          conversation.summary || "",
          conversation.buffer || "",
          conversation.buffer || "",
          purchaseInfo
        );

        console.log(`Gemini analysis results for ${phone}:`, JSON.stringify(analysis));

        // 4. Apply Gemini actions to database
        let createdPurchaseId: string | null = null;
        let purchaseState = analysis.state;

        if (analysis.intent === "compra_entrada") {
          // Find latest event to associate purchase with
          const latestEvent = await prisma.events.findFirst({
            orderBy: { created_at: "desc" },
          });

          if (latestEvent) {
            const ticketCount = analysis.cantidad || 1;
            const pricePerTicket = 10000;
            const total = ticketCount * pricePerTicket;

            const newPurchase = await prisma.purchases.create({
              data: {
                buyer_phone: phone,
                conversation_id: conversation.id,
                event_id: latestEvent.id,
                total_amount: BigInt(total),
                paid_amount: BigInt(0),
                state: "PENDING",
              },
            });
            createdPurchaseId = newPurchase.id;
            console.log(`Created PENDING purchase ${newPurchase.id} for ${ticketCount} tickets.`);
          } else {
            console.warn("Could not create purchase: No events found in DB.");
          }
        } else if (analysis.intent === "compra_cerrada") {
          // Confirm payment and generate tickets
          const latestEvent = await prisma.events.findFirst({
            orderBy: { created_at: "desc" },
          });

          if (latestEvent) {
            let targetPurchase: any = latestPurchase;
            const ticketCount = analysis.cantidad || 1;
            const total = ticketCount * 10000;

            if (!targetPurchase) {
              targetPurchase = await prisma.purchases.create({
                data: {
                  buyer_phone: phone,
                  conversation_id: conversation.id,
                  event_id: latestEvent.id,
                  total_amount: BigInt(total),
                  paid_amount: BigInt(total),
                  state: "PAID",
                },
              });
            } else {
              targetPurchase = await prisma.purchases.update({
                where: { id: targetPurchase.id },
                data: {
                  state: "PAID",
                  paid_amount: targetPurchase.total_amount || BigInt(total),
                },
              });
            }

            createdPurchaseId = targetPurchase.id;
            console.log(`Confirmed purchase ${targetPurchase.id} as PAID.`);

            // Parse attendee list in 'personas' field
            // Expected format: "Name1 Lastname1 DNI1, Name2 Lastname2 DNI2" or newlines
            if (analysis.personas && analysis.personas.trim() !== "") {
              const attendees = analysis.personas
                .split(/[,\n;]+/)
                .map((a) => a.trim())
                .filter(Boolean);

              for (const attendee of attendees) {
                const parts = attendee.split(/\s+/);
                // Extract DNI (numeric string)
                const dni = parts.find((part) => /^\d+$/.test(part)) || "";
                const nameParts = parts.filter((part) => !/^\d+$/.test(part));
                const firstName = nameParts[0] || "Asistente";
                const lastName = nameParts.slice(1).join(" ") || "Sin Apellido";

                await prisma.tickets.create({
                  data: {
                    first_name: firstName,
                    last_name: lastName,
                    number_assoc: dni || phone,
                    payment_state: true,
                    price: BigInt(10000),
                    purchase_id: targetPurchase.id,
                  },
                });
                console.log(`Created ticket for attendee: ${firstName} ${lastName} (DNI: ${dni})`);
              }
            }
          }
        }

        // 5. Send WhatsApp reply
        if (analysis.response && analysis.response.trim() !== "") {
          try {
            await sendWhatsAppMessage(phone, analysis.response);
            // Save reply to messages history
            await prisma.messages.create({
              data: {
                content: `[Asistente]: ${analysis.response}`,
                conversation_id: conversation.id,
              },
            });
            console.log(`Sent WhatsApp response to ${phone}`);
          } catch (whatsappErr: any) {
            console.error(`Error sending WhatsApp reply to ${phone}: ${whatsappErr.message}`);
          }
        }

        // 6. Log to Discord webhook
        let discordLog = "";
        if (analysis.intent === "compra_entrada") {
          discordLog = `📢 **Nueva compra iniciada**\n📞 Cliente: +${phone}\n🎫 Cantidad solicitada: ${analysis.cantidad || 1}\n💬 Respuesta de la IA: "${analysis.response}"`;
        } else if (analysis.intent === "compra_cerrada") {
          discordLog = `✅ **Compra CONFIRMADA y PAGADA**\n📞 Cliente: +${phone}\n🎫 Personas registradas: ${analysis.personas || "No especificado"}\n🎉 ¡Entradas creadas con éxito!`;
        } else if (analysis.intent === "otro" && analysis.response) {
          discordLog = `💬 **Interacción de soporte**\n📞 Cliente: +${phone}\n💬 Respuesta de la IA: "${analysis.response}"`;
        }

        if (discordLog && discordLog.trim() !== "") {
          const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
          if (discordWebhookUrl) {
            try {
              await fetch(discordWebhookUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: discordLog,
                }),
              });
              console.log(`Logged event to Discord for ${phone}`);
            } catch (discordErr: any) {
              console.error(`Error logging to Discord for ${phone}: ${discordErr.message}`);
            }
          }
        }

        // Concatenate AI response to conversation buffer
        const aiResponse = analysis.response || "";
        const updatedBuffer = conversation.buffer
          ? `${conversation.buffer}\nAsistente: ${aiResponse}`
          : `Asistente: ${aiResponse}`;

        // 7. Update conversation details and reset pending flag
        await prisma.conversations.update({
          where: { id: conversation.id },
          data: {
            state: analysis.state as any,
            summary: analysis.summary,
            buffer: updatedBuffer, // Save concatenated buffer
            pending: false, // Mark as processed
          },
        });

        processedLogs.push({
          id: conversation.id,
          phone,
          status: "success",
          intent: analysis.intent,
          purchaseCreated: createdPurchaseId,
        });
      } catch (err: any) {
        console.error(`Error processing conversation ${conversation.id}:`, err);
        processedLogs.push({
          id: conversation.id,
          phone: conversation.phone_number,
          status: "failed",
          error: err.message || err.toString(),
        });
      }
    }

    return NextResponse.json({
      message: "Cron execution completed.",
      processed: processedLogs,
    });
  } catch (error: any) {
    console.error("Critical error in process-conversations cron job:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
