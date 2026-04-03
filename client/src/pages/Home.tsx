import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

/**
 * DESIGN PHILOSOPHY: Cyberpunk Minimalism
 * - Dark background (#0a0a0a) with neon accents (cyan #00FFFF, magenta #FF00FF)
 * - Geometric, angular design with minimal rounded corners
 * - High contrast for maximum readability
 * - Rapid animations and precise feedback
 * - Asymmetric layout with alternating message alignment
 */
export default function Home() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bienvenue sur Le S Boot! Je suis votre assistant IA personnel. Posez-moi n'importe quelle question et je ferai de mon mieux pour vous aider.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for AI chat
  const chatMutation = trpc.chat.ask.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the AI endpoint
      const response = await chatMutation.mutateAsync({
        message: input,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center neon-glow">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider neon-glow" style={{ color: "#00FFFF" }}>
                LE S BOOT
              </h1>
              <p className="text-xs text-muted-foreground">Assistant IA Intelligent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full pulse-neon"></div>
            <span className="text-xs text-muted-foreground">En ligne</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 space-y-6 max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} glitch-animation`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-sm ${
                  message.sender === "user"
                    ? "bg-secondary text-secondary-foreground border border-secondary"
                    : "bg-card text-card-foreground border border-primary"
                } neon-border`}
                style={{
                  borderColor: message.sender === "user" ? "#FF00FF" : "#00FFFF",
                  boxShadow:
                    message.sender === "user"
                      ? "0 0 10px #FF00FF inset, 0 0 10px #FF00FF"
                      : "0 0 10px #00FFFF inset, 0 0 10px #00FFFF",
                }}
              >
                <div className="text-sm leading-relaxed">
                  <Streamdown>{message.text}</Streamdown>
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card text-card-foreground border border-primary px-4 py-3 rounded-sm flex items-center gap-2" style={{ borderColor: "#00FFFF" }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00FFFF" }} />
                <span className="text-sm">Le S Boot est en train de réfléchir...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4 max-w-4xl">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-sm focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-sm neon-glow"
              style={{ backgroundColor: "#00FFFF", color: "#000000" }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Appuyez sur Entrée pour envoyer • Le S Boot répond à toutes vos questions
          </p>
        </div>
      </footer>
    </div>
  );
}
