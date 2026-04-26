import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, taskDetails } = await req.json();

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
5. if user ask anything based on the task then do it. user has some tasks. I am giving you the details of those tasks by JSON.stringify from js. TaskDetails:${JSON.stringify(taskDetails)}. If users question is related to his task then find into this details and give answer based on that only.
6.if user ask anything out of the task then ignore the task and find from your intelligence to give the answer.
User Question:
${message}
`;

console.log(prompt)

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
