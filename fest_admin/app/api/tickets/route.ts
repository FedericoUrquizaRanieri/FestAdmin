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

// POST: Create a ticket manually with an associated purchase
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
    const { first_name, last_name, number_assoc, gender, price, event_id } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "El nombre y apellido son requeridos." },
        { status: 400 }
      );
    }

    if (!event_id) {
      return NextResponse.json(
        { error: "El ID del evento es requerido." },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json(
        { error: "El precio es requerido y debe ser un número válido." },
        { status: 400 }
      );
    }

    if (gender && gender !== "MALE" && gender !== "FEMALE") {
      return NextResponse.json(
        { error: "El género debe ser 'MALE' o 'FEMALE'." },
        { status: 400 }
      );
    }

    // Run creation inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the purchase
      const purchase = await tx.purchases.create({
        data: {
          buyer_phone: number_assoc || "",
          total_amount: BigInt(price),
          paid_amount: BigInt(price),
          state: "PAID",
          conversation_id: null,
          event_id: event_id,
        },
      });

      // 2. Create the ticket
      const ticket = await tx.tickets.create({
        data: {
          first_name,
          last_name,
          number_assoc: number_assoc || "",
          payment_state: true,
          gender: gender || null,
          price: BigInt(price),
          purchase_id: purchase.id,
        },
      });

      return ticket;
    });

    return NextResponse.json(serializeData(result), { status: 201 });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
