import dotenv from "dotenv";
import path from "path";
import prisma from "../prisma";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function verifyDb() {
  console.log("🔍 Starting Database Verification...\n");

  const phone = "5492914123456";

  // 1. Fetch conversation
  const conversation = await prisma.conversations.findFirst({
    where: { phone_number: phone },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
      },
      purchases: {
        include: {
          tickets: true,
        },
      },
    },
  });

  if (!conversation) {
    console.error(`❌ Conversation not found for phone: ${phone}`);
    return;
  }

  console.log("📱 Conversation details:");
  console.log(`- ID: ${conversation.id}`);
  console.log(`- State: ${conversation.state}`);
  console.log(`- Buffer:`);
  console.log(conversation.buffer ? conversation.buffer.split("\n").map(l => `  > ${l}`).join("\n") : "  [Empty]");
  console.log(`- Summary: ${conversation.summary}`);
  console.log("\n💬 Messages Table Content:");
  if (conversation.messages.length === 0) {
    console.log("  [No messages stored in DB]");
  } else {
    conversation.messages.forEach((m, idx) => {
      console.log(`  ${idx + 1}. [${m.created_at.toISOString()}] ${m.content}`);
    });
  }

  // Check if any message in the messages list starts with "[Asistente]" or is from assistant
  const hasAiMessagesInTable = conversation.messages.some(m => m.content?.includes("[Asistente]"));
  if (hasAiMessagesInTable) {
    console.log("❌ ERROR: Found AI messages stored in the `messages` table!");
  } else {
    console.log("✅ SUCCESS: No AI messages found in the `messages` table.");
  }

  // Check if buffer contains "Asistente:"
  const hasAiInBuffer = conversation.buffer?.includes("Asistente:");
  if (hasAiInBuffer) {
    console.log("❌ ERROR: Found 'Asistente:' response in conversation buffer!");
  } else {
    console.log("✅ SUCCESS: No AI responses found in the conversation buffer.");
  }

  console.log("\n🎫 Purchases & Tickets:");
  if (conversation.purchases.length === 0) {
    console.log("  [No purchases found]");
  } else {
    for (const purchase of conversation.purchases) {
      console.log(`  - Purchase ID: ${purchase.id}`);
      console.log(`    State: ${purchase.state}`);
      console.log(`    Total Amount: ${purchase.total_amount?.toString()}`);
      console.log(`    Paid Amount: ${purchase.paid_amount?.toString()}`);
      console.log(`    Tickets:`);
      if (purchase.tickets.length === 0) {
        console.log("      [No tickets found for this purchase]");
      } else {
        purchase.tickets.forEach((t) => {
          console.log(`      • Ticket: ${t.first_name} ${t.last_name}`);
          console.log(`        DNI / Number Assoc: ${t.number_assoc}`);
          console.log(`        Gender: ${t.gender}`);
          console.log(`        Price: ${t.price?.toString()}`);
        });
      }
    }
  }

  console.log("\n🏁 Verification complete.");
}

verifyDb()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
