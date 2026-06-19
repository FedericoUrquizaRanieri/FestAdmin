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
      const audioPath = path.join(process.cwd(), "public", "uploads", "WhatsApp Ptt 2026-06-19 at 13.01.32.ogg");
      const buffer = await fs.readFile(audioPath);
      return { buffer, mimeType: "audio/ogg; codecs=opus" };
    }

    const imagePath = path.join(process.cwd(), "public", "uploads", "WhatsApp Image 2026-06-07 at 12.03.08.jpeg");
    const buffer = await fs.readFile(imagePath);
    return { buffer, mimeType: "image/jpeg" };
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
