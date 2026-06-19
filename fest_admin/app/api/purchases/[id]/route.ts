import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// GET: Retrieve a purchase by ID with all its corresponding transfers (transfer_auth)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const purchase = await prisma.purchases.findUnique({
      where: {
        id,
      },
      include: {
        transfer_auth: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeData(purchase));
  } catch (error: any) {
    console.error("Error fetching purchase details:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH: Update the review state of a specific transfer belonging to the purchase
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: purchaseId } = await params;
    const body = await req.json();
    const { transfer_id, state } = body;

    if (!transfer_id) {
      return NextResponse.json(
        { error: "transfer_id is required." },
        { status: 400 }
      );
    }

    if (state !== "UNDER_REVIEW" && state !== "APPROVED" && state !== "REJECTED") {
      return NextResponse.json(
        { error: "Invalid transfer state. Must be UNDER_REVIEW, APPROVED, or REJECTED." },
        { status: 400 }
      );
    }

    // Security: Verify the transfer exists and belongs to this specific purchase
    const transfer = await prisma.transfer_auth.findFirst({
      where: {
        id: BigInt(transfer_id),
        purchase_id: purchaseId,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found or does not belong to this purchase." },
        { status: 404 }
      );
    }

    // Update the transfer state
    const updatedTransfer = await prisma.transfer_auth.update({
      where: {
        id: BigInt(transfer_id),
      },
      data: {
        state,
      },
    });

    if (state === "APPROVED") {
      const purchase = await prisma.purchases.findUnique({
        where: { id: purchaseId },
      });

      if (purchase) {
        await prisma.purchases.update({
          where: { id: purchaseId },
          data: {
            state: "PAID",
            paid_amount: purchase.total_amount || BigInt(0),
          },
        });

        await prisma.tickets.updateMany({
          where: { purchase_id: purchaseId },
          data: {
            payment_state: true,
          },
        });

        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          try {
            await fetch(discordWebhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: `✅ **Compra APROBADA y PAGADA**\n📞 Cliente: +${purchase.buyer_phone}\n💰 Monto: $${purchase.total_amount ? Number(purchase.total_amount) : 0}\n🎉 ¡Entradas activadas con éxito!`,
              }),
            });
            console.log(`Logged payment approval to Discord for purchase ${purchaseId}`);
          } catch (discordErr: any) {
            console.error(`Error logging approval to Discord: ${discordErr.message}`);
          }
        }
      }
    } else if (state === "REJECTED") {
      const purchase = await prisma.purchases.findUnique({
        where: { id: purchaseId },
      });

      if (purchase) {
        await prisma.purchases.update({
          where: { id: purchaseId },
          data: {
            state: "PENDING",
            paid_amount: BigInt(0),
          },
        });

        await prisma.tickets.updateMany({
          where: { purchase_id: purchaseId },
          data: {
            payment_state: false,
          },
        });

        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          try {
            await fetch(discordWebhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: `❌ **Transferencia RECHAZADA**\n📞 Cliente: +${purchase.buyer_phone}\n⚠️ Las entradas continúan pendientes de pago (inactivas).`,
              }),
            });
            console.log(`Logged payment rejection to Discord for purchase ${purchaseId}`);
          } catch (discordErr: any) {
            console.error(`Error logging rejection to Discord: ${discordErr.message}`);
          }
        }
      }
    }

    return NextResponse.json(serializeData(updatedTransfer));
  } catch (error: any) {
    console.error("Error updating transfer state:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
