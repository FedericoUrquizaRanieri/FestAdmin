import { promises as fs } from "fs";
import path from "path";

/**
 * Sends a text message to a user via WhatsApp Meta API
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (
    process.env.MOCK_APIS === "true" ||
    !phoneId ||
    !accessToken ||
    phoneId === "your_whatsapp_phone_number_id_here" ||
    accessToken === "your_whatsapp_graph_api_access_token_here"
  ) {
    console.log(`[MOCK WHATSAPP SEND] To: ${to}, Message: ${text}`);
    return;
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        body: text,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}. Details: ${errorText}`);
  }
}

/**
 * Downloads binary media files from the Meta API using a media ID
 */
export async function downloadWhatsAppMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (
    process.env.MOCK_APIS === "true" ||
    !accessToken ||
    accessToken === "your_whatsapp_graph_api_access_token_here" ||
    mediaId.startsWith("mock_")
  ) {
    console.log(`[MOCK WHATSAPP MEDIA DOWNLOAD] Media ID: ${mediaId}`);
    if (mediaId.includes("audio")) {
      // Generate a valid 1-second WAV silence file programmatically
      const wavSilence = createWaveSilence();
      return { buffer: wavSilence, mimeType: "audio/wav" };
    }
    // Return a base64 encoded valid 1-pixel PNG image
    const mockImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    return { buffer: mockImage, mimeType: "image/png" };
  }

  // 1. Get media metadata URL
  const metaResponse = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!metaResponse.ok) {
    const errText = await metaResponse.text();
    throw new Error(`Meta media metadata API returned ${metaResponse.status}: ${errText}`);
  }

  const metaData = await metaResponse.json();
  const mediaUrl = metaData.url;
  const mimeType = metaData.mime_type || "application/octet-stream";

  if (!mediaUrl) {
    throw new Error("No URL found in Meta media metadata response.");
  }

  // 2. Fetch the actual binary data
  const fileResponse = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "curl/7.64.1", // Needed to bypass security filters on Meta Graph API
    },
  });

  if (!fileResponse.ok) {
    const errText = await fileResponse.text();
    throw new Error(`Failed to download media file from Meta: ${fileResponse.statusText}. Details: ${errText}`);
  }

  const arrayBuffer = await fileResponse.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType,
  };
}

/**
 * Uploads a file buffer to a Supabase storage bucket via REST API
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  bucketName: string = "transfer_images"
): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceKey ||
    supabaseUrl === "your_supabase_url_here" ||
    serviceKey === "your_supabase_service_role_key_here"
  ) {
    console.log(`[MOCK SUPABASE UPLOAD] Mocking file upload because credentials are placeholders or not set: ${filename}`);
    return `https://supabase.co/mock-transfer-${filename}`;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");
  
  // REST API upload path
  const uploadUrl = `${cleanUrl}/storage/v1/object/${bucketName}/${filename}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": mimeType,
      // Upsert header to allow overwriting if same filename
      "x-upsert": "true",
    },
    body: buffer as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${errorText}`);
  }

  // Construct and return the public URL for the uploaded object
  return `${cleanUrl}/storage/v1/object/public/${bucketName}/${filename}`;
}

/**
 * Generates a valid 1-second silence WAVE file buffer.
 * Used for testing audio transcription API endpoints without hitting Meta.
 */
function createWaveSilence(): Buffer {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = sampleRate * numChannels * (bitsPerSample / 8) * 1; // 1 second
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Remaining bytes are filled with 0 (silence)
  return buffer;
}
