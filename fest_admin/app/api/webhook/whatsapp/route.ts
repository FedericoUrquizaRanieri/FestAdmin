import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { promises as fs } from "fs";
import path from "path";
import { downloadWhatsAppMedia, uploadToSupabaseStorage } from "@/lib/whatsapp";
import { transcribeAudio } from "@/lib/gemini";

// GET: Webhook verification by Meta
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === "subscribe" && token === verifyToken) {
        console.log("WEBHOOK_VERIFIED");
        return new Response(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }
    return new Response("Bad Request", { status: 400 });
  } catch (error: any) {
    console.error("Error in webhook verification GET:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST: Handle incoming WhatsApp message webhook events
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify webhook object type
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid object type" }, { status: 400 });
    }

    if (!body.entry || body.entry.length === 0) {
      return NextResponse.json({ status: "ignored", reason: "no entries" });
    }

    for (const entry of body.entry) {
      const changes = entry.changes;
      if (!changes) continue;

      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        const messages = value.messages;
        if (!messages || messages.length === 0) {
          // Ignore statuses or other non-message events
          continue;
        }

        for (const message of messages) {
          const from = message.from; // Sender phone number
          const msgType = message.type;

          if (!from) continue;

          // Find or create conversation for this number
          let conversation = await prisma.conversations.findFirst({
            where: { phone_number: from },
          });

          if (!conversation) {
            conversation = await prisma.conversations.create({
              data: {
                phone_number: from,
                state: "IDLE",
                control_over: "AI",
                pending: true,
                last_message: new Date(),
                buffer: "",
                summary: "",
              },
            });
          }

          let messageContent = "";

          if (msgType === "text" && message.text) {
            messageContent = message.text.body;
            console.log(`Text message processed for ${from}: ${messageContent}`);
          } else if (msgType === "image" && message.image) {
            const imageId = message.image.id;
            // Find latest event to associate with the purchase
            const latestEvent = await prisma.events.findFirst({
              orderBy: { created_at: "desc" },
            });

            if (!latestEvent) {
              console.warn("No event found. Cannot create purchase for image message.");
              continue;
            }

            // Find if there is an existing purchase for this conversation
            const existingPurchase = await prisma.purchases.findFirst({
              where: { conversation_id: conversation.id },
              orderBy: { created_at: "desc" },
            });

            let purchase;
            if (!existingPurchase) {
              // Create purchase
              purchase = await prisma.purchases.create({
                data: {
                  buyer_phone: from,
                  conversation_id: conversation.id,
                  event_id: latestEvent.id,
                  state: "PENDING",
                },
              });
              console.log(`Created new PENDING purchase ${purchase.id} for image message.`);
            } else {
              purchase = existingPurchase;
              console.log(`Reusing existing purchase ${purchase.id} for image message.`);
            }

            let storagePath = "";
            let fileBuffer: Buffer | null = null;
            let mimeType = "";

            try {
              const result = await downloadWhatsAppMedia(imageId);
              fileBuffer = result.buffer;
              mimeType = result.mimeType;
            } catch (downloadErr: any) {
              console.error(`Failed to download WhatsApp image media: ${downloadErr.message}`);
            }

            if (fileBuffer) {
              try {
                let ext = "jpg";
                if (mimeType.includes("png")) ext = "png";
                else if (mimeType.includes("webp")) ext = "webp";
                else if (mimeType.includes("jpeg")) ext = "jpeg";

                const filename = `transfer-${purchase.id}-${Date.now()}.${ext}`;
                storagePath = await uploadToSupabaseStorage(fileBuffer, mimeType, filename, "transfer_images");
                console.log(`Successfully uploaded image to Supabase: ${storagePath}`);
              } catch (uploadErr: any) {
                console.error(`Failed to upload WhatsApp image to Supabase: ${uploadErr.message}`);
              }
            }

            // Create transfer_auth record (if storagePath is empty, it means we don't have a valid image path)
            await prisma.transfer_auth.create({
              data: {
                phone_number: from,
                storage_path: storagePath || null,
                state: "UNDER_REVIEW",
                purchase_id: purchase.id,
              },
            });

            messageContent = `[Imagen recibida - Comprobante de transferencia: ${storagePath}]`;
            console.log(`Image message processed for ${from}. Purchase created: ${purchase.id}.`);
          } else if (msgType === "audio" && message.audio) {
            const audioId = message.audio.id;
            let transcription = "";
            try {
              const { buffer, mimeType: downloadedMime } = await downloadWhatsAppMedia(audioId);
              transcription = await transcribeAudio(buffer, downloadedMime);
              console.log(`Successfully transcribed audio for ${from}: ${transcription}`);
            } catch (err: any) {
              console.error(`Failed to download or transcribe audio: ${err.message}`);
              transcription = "[Error transcribiendo nota de voz]";
            }

            messageContent = `[Nota de voz transcrita]: ${transcription}`;
            console.log(`Audio message processed for ${from}.`);
          } else {
            messageContent = `[Mensaje tipo '${msgType}' no soportado actualmente]`;
            console.log(`Unsupported message type '${msgType}' received from ${from}.`);
          }

          // Save message to messages table (for dashboard UI display)
          await prisma.messages.create({
            data: {
              content: messageContent,
              conversation_id: conversation.id,
            },
          });

          // Concatenate to conversation buffer and set pending: true
          const currentBuffer = conversation.buffer || "";
          const newBuffer = currentBuffer === "" 
            ? `Cliente: ${messageContent}` 
            : `${currentBuffer}\nCliente: ${messageContent}`;

          // Update conversation in database
          await prisma.conversations.update({
            where: { id: conversation.id },
            data: {
              buffer: newBuffer,
              pending: true,
              last_message: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
