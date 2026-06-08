import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// GET: Retrieve a paginated list of tickets for a specific event
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

    // Pagination parameters from the URL
    const limitParam = searchParams.get("limit");
    const skipParam = searchParams.get("skip");

    const take = limitParam ? parseInt(limitParam, 10) : 20;
    const skip = skipParam ? parseInt(skipParam, 10) : 0;

    if (isNaN(take) || take <= 0) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be a positive integer." },
        { status: 400 }
      );
    }

    if (isNaN(skip) || skip < 0) {
      return NextResponse.json(
        { error: "Invalid skip parameter. Must be a non-negative integer." },
        { status: 400 }
      );
    }

    // Filter tickets where their associated purchase belongs to the event, and optionally match name search
    const searchQuery = searchParams.get("search") || "";

    const whereClause: any = {
      purchases: {
        event_id: eventId,
      },
    };

    if (searchQuery) {
      whereClause.OR = [
        {
          first_name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ];
    }

    // Run count and query in parallel to optimize DB load
    const [total, tickets] = await Promise.all([
      prisma.tickets.count({ where: whereClause }),
      prisma.tickets.findMany({
        where: whereClause,
        take,
        skip,
        orderBy: [
          { first_name: "asc" },
          { last_name: "asc" },
        ],
      }),
    ]);

    return NextResponse.json(
      serializeData({
        tickets,
        total,
        take,
        skip,
      })
    );
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
