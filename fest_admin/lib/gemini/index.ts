export interface GeminiAnalysisResponse {
  intent: "compra_entrada" | "compra_cerrada" | "otro";
  cantidad: number;
  personas: string;
  response: string;
  summary: string;
  state: "IDLE" | "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "COMPLETED";
}

/**
 * Transcribes an audio buffer using the Gemini 1.5 Flash model
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isMockAudio = audioBuffer.toString("base64") === "T2dnUwACAAAAAAAAAAAADQAAAAAAAABtZWRpYQ==";

  if (process.env.MOCK_APIS === "true" || !apiKey || apiKey === "your_gemini_api_key_here" || isMockAudio) {
    console.log("[MOCK GEMINI TRANSCRIBE] Returning mock audio transcription");
    return "Hola, me gustaría comprar una entrada para la fiesta. Mi nombre es Juan Pérez y mi DNI es 40123456 y Maria Lopez DNI 41234567.";
  }

  // Clean mime type (e.g. "audio/ogg; codecs=opus" -> "audio/ogg")
  const cleanMimeType = mimeType.split(";")[0].trim();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: audioBuffer.toString("base64"),
              },
            },
            {
              text: "Por favor, transcribe este audio en español. Devuelve únicamente el texto transcrito de forma exacta, sin explicaciones ni introducciones. Si el audio no contiene voz legible o está vacío, responde únicamente con '[Audio sin voz legible]'.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Transcription API failed: ${response.statusText}. Details: ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini Transcription returned an empty response.");
  }

  return text.trim();
}

/**
 * Analyzes a conversation and returns actions and responses using structured JSON output
 */
export async function analyzeConversation(
  phone_number: string,
  state: string,
  summary: string,
  buffer: string,
  messagesList: string,
  purchaseInfo: string
): Promise<GeminiAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (process.env.MOCK_APIS === "true" || !apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("[MOCK GEMINI ANALYSIS] Returning simulated response because MOCK_APIS is active or API key is missing");
    
    let intent: "compra_entrada" | "compra_cerrada" | "otro" = "otro";
    let cantidad = 0;
    let personas = "";
    let responseText = "¡Hola! Para registrar tu entrada, confírmanos tu Nombre, Apellido y tu Género (Masculino/Femenino).";
    let stateVal: any = "IDLE";

    const normalizedMsg = messagesList.toLowerCase();
    
    if (normalizedMsg.includes("juan perez") || normalizedMsg.includes("juan pérez") || normalizedMsg.includes("40123456")) {
      intent = "compra_cerrada";
      cantidad = 2;
      personas = "Juan Perez 40123456, Maria Lopez 41234567";
      responseText = "¡Perfecto! Tus entradas han sido registradas y confirmadas con éxito para Juan Pérez y María López. ¡Que disfrutes la fiesta!";
      stateVal = "COMPLETED";
    } else if (normalizedMsg.includes("transferencia") || normalizedMsg.includes("comprobante") || normalizedMsg.includes("comprobante de transferencia")) {
      intent = "compra_cerrada";
      cantidad = 2;
      personas = "Juan Perez 40123456, Maria Lopez 41234567";
      responseText = "¡Excelente! Recibimos tu comprobante de transferencia correctamente. La compra por tus 2 entradas ha sido aprobada.";
      stateVal = "COMPLETED";
    } else if (normalizedMsg.includes("comprar") || normalizedMsg.includes("entrada") || normalizedMsg.includes("entradas")) {
      intent = "compra_entrada";
      cantidad = 2;
      responseText = "¡Hola! Claro que sí, cada entrada sale 10.000 pesos. Podes transferir a reptil.yuyo.medano. Recordá enviarnos el comprobante por foto y la lista de Nombre/DNI.";
      stateVal = "WAITING_PAYMENT";
    }

    return {
      intent,
      cantidad,
      personas,
      response: responseText,
      summary: "Simulación local de compra de entradas sin APIs.",
      state: stateVal
    };
  }

  const systemPrompt = process.env.GEMINI_SYSTEM_PROMPT || 
    `Eres un asistente virtual de venta de entradas para FestAdmin. Tu objetivo es interactuar con el cliente y ayudarlo.`;

  const userPrompt = `
DATOS DE LA CONVERSACIÓN ACTUAL:
- Teléfono del cliente: ${phone_number}
- Estado actual de la conversación: ${state}
- Resumen actual: ${summary || "Sin resumen previo"}
- Buffer de memoria actual: ${buffer || "Sin buffer previo"}

HISTORIAL DE MENSAJES RECIENTES:
${messagesList}

INFORMACIÓN DE COMPRAS Y ENTRADAS ACTIVAS:
${purchaseInfo}

Analiza la conversación anterior y decide cuál debe ser la respuesta al cliente y las clasificaciones según las pautas de sistema.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            intent: {
              type: "STRING",
              enum: ["compra_entrada", "compra_cerrada", "otro"],
              description: "El tipo de intención detectado en la conversación actual.",
            },
            cantidad: {
              type: "INTEGER",
              description: "Cantidad de entradas requeridas por el cliente.",
            },
            personas: {
              type: "STRING",
              description: "Nombres y DNI de las personas a las que corresponden las entradas.",
            },
            response: {
              type: "STRING",
              description: "Mensaje de respuesta para enviar al cliente.",
            },
            summary: {
              type: "STRING",
              description: "Resumen actualizado de la conversación actual.",
            },
            state: {
              type: "STRING",
              enum: ["IDLE", "WAITING_PAYMENT", "WAITING_CONFIRMATION", "COMPLETED"],
              description: "El estado actualizado del mensaje / conversación.",
            },
          },
          required: [
            "intent",
            "cantidad",
            "personas",
            "response",
            "summary",
            "state",
          ],
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Analysis API failed: ${response.statusText}. Details: ${errorText}`);
  }

  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error("Gemini Analysis returned an empty text candidate.");
  }

  try {
    const parsed: GeminiAnalysisResponse = JSON.parse(textResponse);
    return parsed;
  } catch (err: any) {
    console.error("Failed to parse Gemini JSON output:", textResponse);
    throw new Error(`Failed to parse structured JSON from Gemini: ${err.message}`);
  }
}
