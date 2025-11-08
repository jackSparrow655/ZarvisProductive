// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// export default function Home() {
//   const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
//     []
//   );
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("/api/chat", { message: input });
//       const reply = res.data.reply || "No response from AI.";
//       setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
//     } catch (err: any) {
//       console.error("Chat error:", err.response?.data || err.message);
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: "⚠️ Something went wrong. Check the console for details.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-lg p-6 space-y-4">
//       <h1 className="text-2xl font-semibold text-center">🎓 Study Buddy</h1>

//       <div className="h-96 overflow-y-auto border rounded-md p-4 bg-white">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`mb-3 ${
//               msg.sender === "user" ? "text-right" : "text-left"
//             }`}
//           >
//             {msg.sender === "user" ? (
//               <p className="inline-block px-3 py-2 rounded-lg bg-blue-500 text-white whitespace-pre-line">
//                 {msg.text}
//               </p>
//             ) : (
//               <div className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-900 prose prose-sm max-w-none">
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {msg.text}
//                 </ReactMarkdown>
//               </div>
//             )}
//           </div>
//         ))}

//         {loading && <p className="text-center text-gray-500">Thinking...</p>}
//       </div>

//       <div className="flex gap-2">
//         <Input
//           placeholder="Ask a study question..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <Button onClick={sendMessage}>Send</Button>
//       </div>
//     </Card>
//   );
// }

"use client";
//@ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Expand, Minimize, Send, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function GeminiChatButton() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setChatOpen(true)} variant="outline">
        <Bot className="mr-1 h-4 w-4" />
        <span>Ask AI</span>
      </Button>
      <GeminiChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

interface GeminiChatBoxProps {
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function GeminiChatBox({ open, onClose }: GeminiChatBoxProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm your Jarvis study assistant! Ask me anything related to your studies, and I'll explain it clearly.",
    },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const res = await axios.post("/api/chat", { message: input });
      const reply =
        res.data.reply ||
        "Sorry, I couldn't find an answer for that right now.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", text: reply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          text: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-10 bg-card fixed right-4 bottom-4 z-50 flex flex-col rounded-lg border shadow-lg duration-300 2xl:right-16",
        isExpanded
          ? "h-[650px] max-h-[90vh] w-[550px]"
          : "h-[500px] max-h-[80vh] w-80 sm:w-96"
      )}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground flex items-center justify-between rounded-t-lg border-b p-3">
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <h3 className="font-medium">JARVIS Study Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize /> : <Expand />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMessages([
                {
                  id: "welcome",
                  role: "assistant",
                  text: "I'm your Jarvis study assistant! Ask me anything related to your studies.",
                },
              ])
            }
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            title="Clear chat"
            disabled={isProcessing}
          >
            <Trash />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "mb-2 flex max-w-[80%] flex-col prose dark:prose-invert text-sm",
              m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted first:prose-p:mt-0"
              )}
            >
              {m.role === "assistant" && (
                <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
                  <Bot className="text-primary size-3" />
                  Jarvis
                </div>
              )}
              <Markdown remarkPlugins={[remarkGfm]}>{m.text}</Markdown>
            </div>
          </div>
        ))}
        {isProcessing && <Loader />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form className="flex gap-2 border-t p-3" onSubmit={sendMessage}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your studies..."
          className="max-h-[120px] min-h-[40px] resize-none overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
          }}
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isProcessing}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function Loader() {
  return (
    <div className="ml-2 flex items-center gap-1 py-2">
      <div className="bg-primary size-1.5 animate-pulse rounded-full" />
      <div className="bg-primary size-1.5 animate-pulse rounded-full delay-150" />
      <div className="bg-primary size-1.5 animate-pulse rounded-full delay-300" />
    </div>
  );
}
