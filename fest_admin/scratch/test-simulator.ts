/**
 * Test Simulator for FestAdmin WhatsApp Integration
 * 
 * Instructions:
 * 1. Make sure your local development server is running: `npm run dev`
 * 2. In another terminal, run this script using: `npx tsx scratch/test-simulator.ts`
 */

const LOCAL_URL = "http://localhost:3001";
const TEST_PHONE = "5492914123456";

async function runSimulator() {
  console.log("🚀 Starting FestAdmin WhatsApp & Gemini Integration Simulator...\n");

  // ==========================================
  // SCENARIO 1: Simulate Text Message ("comprar")
  // ==========================================
  console.log("💬 Scenario 1: Simulating incoming text message ('Hola, me gustaría comprar 2 entradas')...");
  const textPayload = createMessagePayload(TEST_PHONE, "wamid.text_msg_101", {
    type: "text",
    text: { body: "Hola, me gustaría comprar 2 entradas" }
  });

  await triggerWebhook(textPayload);

  // ==========================================
  // SCENARIO 2: Simulate Audio Voice Note
  // ==========================================
  console.log("🎙️ Scenario 2: Simulating incoming audio voice note message (runs real Gemini transcription)...");
  const audioPayload = createMessagePayload(TEST_PHONE, "wamid.audio_msg_102", {
    type: "audio",
    audio: {
      id: "mock_audio_file_id_789",
      mime_type: "audio/wav"
    }
  });

  await triggerWebhook(audioPayload);

  // ==========================================
  // SCENARIO 3: Simulate Image (Comprobante)
  // ==========================================
  console.log("📸 Scenario 3: Simulating incoming transfer screenshot (uploads to Supabase Storage)...");
  const imagePayload = createMessagePayload(TEST_PHONE, "wamid.image_msg_103", {
    type: "image",
    image: {
      id: "mock_image_file_id_456",
      mime_type: "image/png"
    }
  });

  await triggerWebhook(imagePayload);

  // ==========================================
  // SCENARIO 4: Trigger the Cron Job (Run 1)
  // ==========================================
  console.log("⏳ Scenario 4: Triggering Cron Job (Run 1) to process purchase request and transfer proof...");
  await triggerCron();

  // ==========================================
  // SCENARIO 5: Simulate Text Message with Names & DNI
  // ==========================================
  console.log("💬 Scenario 5: Simulating customer providing attendee names & DNIs...");
  const namesPayload = createMessagePayload(TEST_PHONE, "wamid.text_msg_104", {
    type: "text",
    text: { body: "Acá van los datos de las personas: Juan Perez 40123456 y Maria Lopez 41234567" }
  });

  await triggerWebhook(namesPayload);

  // ==========================================
  // SCENARIO 6: Trigger the Cron Job (Run 2)
  // ==========================================
  console.log("⏳ Scenario 6: Triggering Cron Job (Run 2) to finalize purchase and create tickets...");
  await triggerCron();

  console.log("🏁 Simulation run completed.");
}

// Helper to construct WhatsApp JSON payloads
function createMessagePayload(fromPhone: string, messageId: string, messageContent: any) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "0",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15555555555",
                phone_number_id: "123456789"
              },
              contacts: [{ profile: { name: "Juan Tester" }, wa_id: fromPhone }],
              messages: [
                {
                  from: fromPhone,
                  id: messageId,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  ...messageContent
                }
              ]
            }
          }
        ]
      }
    ]
  };
}

// Helper to hit the local webhook endpoint
async function triggerWebhook(payload: any) {
  try {
    const res = await fetch(`${LOCAL_URL}/api/webhook/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`➡️ Webhook POST response status: ${res.status}`);
    const data = await res.json();
    console.log("   Result:", data, "\n");
  } catch (err: any) {
    console.error("❌ Failed to send webhook request:", err.message);
  }
}

// Helper to hit the local cron endpoint
async function triggerCron() {
  try {
    const res = await fetch(`${LOCAL_URL}/api/cron/process-conversations`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET || "cronfestadminsecret"}`
      }
    });
    console.log(`➡️ Cron GET response status: ${res.status}`);
    const data = await res.json();
    console.log("   Result:", JSON.stringify(data, null, 2), "\n");
  } catch (err: any) {
    console.error("❌ Failed to trigger cron job:", err.message);
  }
}

runSimulator();
