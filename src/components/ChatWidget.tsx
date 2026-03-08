import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import rzdLogo from "@/assets/logo-rzd-final.png";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rzd-assistant`;

// Contextual suggestions based on current route
function getSuggestions(pathname: string): { text: string }[] {
  if (pathname.startsWith("/chord/")) {
    const chordId = pathname.split("/chord/")[1];
    return [
      { text: `Quais músicas usam o acorde ${chordId}?` },
      { text: `Qual a progressão mais comum com ${chordId}?` },
      { text: `Como facilitar a transição para ${chordId}?` },
    ];
  }
  if (pathname === "/pratica") {
    return [
      { text: "Qual a melhor rotina de prática diária?" },
      { text: "Como melhorar transições de acordes?" },
      { text: "Exercícios para velocidade no cavaquinho?" },
    ];
  }
  if (pathname === "/campo-harmonico") {
    return [
      { text: "Explique campo harmônico maior." },
      { text: "Quais acordes do campo de Dó?" },
      { text: "Diferença entre campo maior e menor?" },
    ];
  }
  if (pathname === "/afinador") {
    return [
      { text: "Qual a afinação padrão do cavaquinho?" },
      { text: "Diferença entre DGBD e DGBE?" },
      { text: "Como afinar de ouvido?" },
    ];
  }
  if (pathname === "/identifier") {
    return [
      { text: "Como identificar acordes pelo som?" },
      { text: "Diferença entre C7 e Cmaj7?" },
      { text: "O que é um acorde invertido?" },
    ];
  }
  return [
    { text: "Como fazer o acorde de Dó maior?" },
    { text: "Progressão comum de samba?" },
    { text: "Diferença entre C7 e Cmaj7?" },
  ];
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    let cleaned = line.replace(/^#{1,4}\s*/, "");
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    cleaned = cleaned.replace(/^\*\s+/, "• ");
    cleaned = cleaned.replace(/^-\s+/, "• ");
    if (line.match(/^#{1,4}\s/)) {
      elements.push(<p key={idx} className="font-semibold text-foreground mt-2 mb-0.5 text-[13px]" dangerouslySetInnerHTML={{ __html: cleaned }} />);
    } else if (cleaned.startsWith("• ")) {
      elements.push(<p key={idx} className="pl-3 text-[12px]" dangerouslySetInnerHTML={{ __html: cleaned }} />);
    } else if (cleaned.trim() === "") {
      elements.push(<div key={idx} className="h-1.5" />);
    } else {
      elements.push(<p key={idx} className="text-[12px]" dangerouslySetInnerHTML={{ __html: cleaned }} />);
    }
  });
  return elements;
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  const suggestions = getSuggestions(location.pathname);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          modeHint: "Responda de forma concisa e didática, use bullet points e destaque termos musicais em negrito.",
          context: buildContext(location.pathname),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        toast.error(err.error || `Erro ${resp.status}`);
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Falha na comunicação com o assistente.");
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full overflow-hidden shadow-lg bg-white"
            style={{
              boxShadow: "0 4px 24px -2px hsl(var(--primary) / 0.4), 0 0 0 3px hsl(var(--primary) / 0.12)",
            }}
          >
            <img src={rzdLogo} alt="RedData A.I." className="h-full w-full object-contain p-2" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-white/20"
            style={{
              width: "min(380px, calc(100vw - 48px))",
              height: "min(540px, calc(100vh - 100px))",
              background: "linear-gradient(160deg, hsl(0 0% 100% / 0.10), hsl(0 0% 98% / 0.06))",
              backdropFilter: "blur(24px) saturate(1.3)",
              WebkitBackdropFilter: "blur(24px) saturate(1.3)",
              boxShadow:
                "0 12px 48px -8px hsl(210 25% 15% / 0.12), 0 0 0 1px hsl(0 0% 100% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-border/10">
              <div className="flex items-center gap-3">
                <img src={rzdLogo} alt="RZD" className="h-7 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">RedData A.I.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Acordes de Cavaquinho</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Messages / Welcome */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden bg-white"
                    style={{
                      boxShadow: "0 0 24px 4px hsl(var(--primary) / 0.12)",
                      border: "2px solid hsl(var(--primary) / 0.15)",
                    }}
                  >
                    <img src={rzdLogo} alt="RedData A.I." className="h-full w-full object-contain p-2" />
                  </div>

                  <p className="text-[13px] text-muted-foreground text-center max-w-[280px] leading-relaxed">
                    Pergunte sobre acordes, progressões ou teoria do cavaquinho.
                  </p>

                  {/* Contextual Suggestion Capsules */}
                  <div className="flex flex-col gap-2.5 w-full mt-1">
                    {suggestions.map((s, i) => {
                      const isHovered = hoveredSuggestion === i;
                      return (
                        <motion.button
                          key={`${location.pathname}-${i}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onMouseEnter={() => setHoveredSuggestion(i)}
                          onMouseLeave={() => setHoveredSuggestion(null)}
                          onClick={() => send(s.text)}
                          className={cn(
                            "flex items-center gap-3 text-left rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-200",
                            isHovered
                              ? "border-primary/50 bg-primary/5 text-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.25)]"
                              : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground"
                          )}
                          style={{
                            border: `1.5px solid ${isHovered ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border) / 0.5)"}`,
                          }}
                        >
                          <span>{s.text}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chat bubbles */}
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-[12.5px] leading-relaxed max-w-[88%]",
                      m.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto text-foreground"
                    )}
                    style={
                      m.role === "assistant"
                        ? {
                            background: "linear-gradient(145deg, hsl(0 0% 97% / 0.95), hsl(210 12% 95% / 0.8))",
                            border: "1px solid hsl(0 0% 0% / 0.05)",
                            backdropFilter: "blur(8px)",
                          }
                        : undefined
                    }
                  >
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                    {m.role === "assistant" && isLoading && i === messages.length - 1 && (
                      <span className="inline-block ml-1 animate-pulse text-primary">|</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div
                  className="mr-auto rounded-2xl px-4 py-3 text-[12.5px] text-muted-foreground max-w-[88%]"
                  style={{
                    background: "linear-gradient(145deg, hsl(0 0% 97% / 0.95), hsl(210 12% 95% / 0.8))",
                    border: "1px solid hsl(0 0% 0% / 0.05)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    Analisando...
                  </span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div
              className="shrink-0 px-4 py-3 border-t border-border/10"
              style={{ background: "hsl(0 0% 100% / 0.35)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-end gap-2.5">
                <div className="relative flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Pergunte ao RedData A.I..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full resize-none rounded-xl border border-border/40 bg-background/70 pl-4 pr-10 py-2.5 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:opacity-50 max-h-[80px] transition-all"
                    style={{ minHeight: "40px" }}
                  />
                </div>
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 active:scale-95 transition-all shadow-md"
                  style={{
                    boxShadow: "0 4px 12px -2px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <span className="text-sm font-bold">&rarr;</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
