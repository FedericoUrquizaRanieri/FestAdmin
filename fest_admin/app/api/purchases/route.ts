import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// GET: Retrieve all purchases in PENDING or PARTIALLY_PAID state for a specific event
export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let eventId = searchParams.get("event_id");

    if (!eventId) {
      // Fallback: use the latest event if event_id is not specified
      const latestEvent = await prisma.events.findFirst({
        orderBy: { created_at: "desc" },
      });
      if (!latestEvent) {
        return NextResponse.json(
          { error: "No events found. Please create an event first." },
          { status: 400 }
        );
      }
      eventId = latestEvent.id;
    }

    // Query pending/partially paid purchases for the event
    const purchases = await prisma.purchases.findMany({
      where: {
        event_id: eventId,
        state: {
          in: ["PENDING", "PARTIALLY_PAID"],
        },
      },
      include: {
        transfer_auth: true,
        conversations: {
          select: {
            phone_number: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(serializeData(purchases));
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
