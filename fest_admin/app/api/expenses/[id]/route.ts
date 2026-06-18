import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { serializeData } from "@/lib/utils";

// DELETE: Delete a specific expense by ID
export async function DELETE(
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
    const expenseId = BigInt(id);

    const deletedExpense = await prisma.expenses.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json(serializeData(deletedExpense));
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
