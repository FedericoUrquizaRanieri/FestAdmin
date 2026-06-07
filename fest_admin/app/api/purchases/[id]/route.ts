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

    return NextResponse.json(serializeData(updatedTransfer));
  } catch (error: any) {
    console.error("Error updating transfer state:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
