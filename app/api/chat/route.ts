import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a helpful AI study assistant.

Rules:
1. Answer the user's question clearly.
2. Then ask ONE short follow-up question to help the user learn better.
3. If the question seems confusing, ask for clarification.
4. If the user seems stressed or unsure, be encouraging.

User Question:
${message}
`;

    const stream = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (error: any) {
    return new Response("Error occurred", { status: 500 });
  }
}
