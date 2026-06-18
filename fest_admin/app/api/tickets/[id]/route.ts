import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// PATCH: Update the checked_in state of a specific ticket
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
    const ticketId = BigInt(id);

    const body = await req.json();
    const { checked_in } = body;

    let checkedInDate: Date | null = null;
    if (checked_in) {
      checkedInDate = new Date();
    }

    const updatedTicket = await prisma.tickets.update({
      where: {
        id: ticketId,
      },
      data: {
        checked_in: checkedInDate,
      },
    });

    return NextResponse.json(serializeData(updatedTicket));
  } catch (error: any) {
    console.error("Error updating ticket check-in status:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
