import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

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
    const { amount, description, event_id } = body;

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Amount is required." },
        { status: 400 }
      );
    }

    let targetEventId = event_id;
    if (!targetEventId) {
      // Fallback: associate with the latest event if event_id is not specified
      const latestEvent = await prisma.events.findFirst({
        orderBy: { created_at: "desc" },
      });
      if (!latestEvent) {
        return NextResponse.json(
          { error: "No events found. Please create an event first." },
          { status: 400 }
        );
      }
      targetEventId = latestEvent.id;
    }

    const newExpense = await prisma.expenses.create({
      data: {
        amount: BigInt(amount),
        description: description || "",
        event_id: targetEventId,
      },
    });

    return NextResponse.json(serializeData(newExpense), { status: 201 });
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
