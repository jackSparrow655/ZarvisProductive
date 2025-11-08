import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize Gemini API client (v1)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ free & available in v1
    console.log("api key = ", process.env.GEMINI_API_KEY);

    const prompt = `You are a helpful AI study assistant for students.
    Only answer educational or study-related questions.
    Question: ${message}`;

    // Generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
