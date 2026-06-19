import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

export const dynamic = "force-dynamic";

// PATCH: Update a specific event's ticket price and/or transfer link alias
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

    const { id } = await params;
    const body = await req.json();
    const { ticket_price, transfer_link } = body;

    const updateData: any = {};
    if (ticket_price !== undefined) {
      updateData.ticket_price = BigInt(ticket_price);
    }
    if (transfer_link !== undefined) {
      updateData.transfer_link = transfer_link;
    }

    const updatedEvent = await prisma.events.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(serializeData(updatedEvent));
  } catch (error: any) {
    console.error("Error updating event details:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
