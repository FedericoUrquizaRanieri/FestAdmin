import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

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

    // Execute all queries concurrently to optimize database response time
    const [
      activeConversationsCount,
      conversationsWithSalesCount,
      totalTicketsCount,
      maleTicketsCount,
      femaleTicketsCount,
      purchasesPendingApprovalCount,
      ticketEarningsAggregate,
      expensesAggregate
    ] = await Promise.all([
      // 1. Number of active conversations for the event
      prisma.conversations.count({
        where: {
          state: {
            in: ["IDLE", "WAITING_PAYMENT", "WAITING_CONFIRMATION"],
          },
          purchases: {
            some: {
              event_id: eventId,
            },
          },
        },
      }),

      // 2. Count of conversations that have sales/purchases with state PENDING, PAID, or PARTIALLY_PAID for the event
      prisma.conversations.count({
        where: {
          purchases: {
            some: {
              event_id: eventId,
              state: {
                in: ["PENDING", "PAID", "PARTIALLY_PAID"],
              },
            },
          },
        },
      }),

      // 3. Total number of tickets (entradas) for the event
      prisma.tickets.count({
        where: {
          payment_state: true,
          purchases: {
            event_id: eventId,
          },
        },
      }),

      // 4. Number of male tickets for the event
      prisma.tickets.count({
        where: {
          gender: "MALE",
          purchases: {
            event_id: eventId,
          },
        },
      }),

      // 5. Number of female tickets for the event
      prisma.tickets.count({
        where: {
          gender: "FEMALE",
          purchases: {
            event_id: eventId,
          },
        },
      }),

      // 6. Count of purchases waiting to be approved for the event
      prisma.purchases.count({
        where: {
          event_id: eventId,
          state: {
            in: ["PENDING", "PARTIALLY_PAID"],
          },
        },
      }),

      // 7. Total earnings from all tickets that have payment state true for the event
      prisma.tickets.aggregate({
        _sum: {
          price: true,
        },
        where: {
          payment_state: true,
          purchases: {
            event_id: eventId,
          },
        },
      }),

      // 8. Total expenses from all expenses for the event
      prisma.expenses.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          event_id: eventId,
        },
      })
    ]);

    const totalTicketEarnings = ticketEarningsAggregate._sum.price
      ? Number(ticketEarningsAggregate._sum.price)
      : 0;

    const totalExpenses = expensesAggregate._sum.amount
      ? Number(expensesAggregate._sum.amount)
      : 0;

    return NextResponse.json(
      serializeData({
        activeConversationsCount,
        conversationsWithSalesCount,
        totalTicketsCount,
        genderStats: {
          male: maleTicketsCount,
          female: femaleTicketsCount,
        },
        purchasesPendingApprovalCount,
        totalTicketEarnings,
        totalExpenses,
      })
    );
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
