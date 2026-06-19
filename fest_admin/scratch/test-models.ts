import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in .env");
    return;
  }
  
  console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);
  
  // Try v1beta
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      console.log("\nv1beta models:");
      data.models?.forEach((m: any) => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods?.join(', ')})`);
      });
    } else {
      console.error(`v1beta listing failed: ${response.status} - ${await response.text()}`);
    }
  } catch (err: any) {
    console.error("v1beta fetch error:", err.message);
  }

  // Try v1
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      console.log("\nv1 models:");
      data.models?.forEach((m: any) => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods?.join(', ')})`);
      });
    } else {
      console.error(`v1 listing failed: ${response.status} - ${await response.text()}`);
    }
  } catch (err: any) {
    console.error("v1 fetch error:", err.message);
  }
}

listModels();
