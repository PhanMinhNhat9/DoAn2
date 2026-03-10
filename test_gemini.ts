
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    console.log("Testing gemini-2.0-flash-lite with the SDK...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("Xin chào, hãy trả lời ngắn gọn: 1+1 bằng mấy?");
    const response = await result.response;
    console.log("✅ Success! Response:", response.text());
  } catch (error: any) {
    console.error("❌ Gemini Error:", error.message || error);
  }
}

test();
