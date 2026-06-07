import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// GET: Retrieve all conversations associated with the given event
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

    // Fetch conversations related to the event through purchases
    const conversations = await prisma.conversations.findMany({
      where: {
        purchases: {
          some: {
            event_id: eventId,
          },
        },
      },
      orderBy: {
        last_message: "desc",
      },
    });

    return NextResponse.json(serializeData(conversations));
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Modify conversation control state (AI vs HUMAN)
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { conversation_id, control_over, state } = body;

    if (!conversation_id) {
      return NextResponse.json(
        { error: "conversation_id is required." },
        { status: 400 }
      );
    }

    // Support both 'control_over' and 'state' in body for flexibility
    const targetControl = control_over || state;
    if (targetControl !== "AI" && targetControl !== "HUMAN") {
      return NextResponse.json(
        { error: "control_over state must be either 'AI' or 'HUMAN'." },
        { status: 400 }
      );
    }

    const updatedConversation = await prisma.conversations.update({
      where: {
        id: conversation_id,
      },
      data: {
        control_over: targetControl,
      },
    });

    return NextResponse.json(serializeData(updatedConversation));
  } catch (error: any) {
    console.error("Error updating conversation control:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
