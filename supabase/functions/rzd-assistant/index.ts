import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um assistente especializado em acordes de cavaquinho do site RZD Music. 

INFORMAÇÕES IMPORTANTES SOBRE O CAVAQUINHO:
- O cavaquinho tem 4 cordas afinadas em D-G-B-D (Ré-Sol-Si-Ré)
- As cordas são numeradas de baixo para cima: 4ª corda (D grave), 3ª corda (G), 2ª corda (B), 1ª corda (D agudo)
- Os diagramas mostram as cordas verticalmente, com a corda mais grave (4ª) à esquerda

ACORDES DISPONÍVEIS NO DICIONÁRIO RZD MUSIC:
Para cada nota (C, C#/Db, D, Eb/D#, E, F, F#/Gb, G, Ab/G#, A, Bb/A#, B), temos as seguintes variações:
- Maior (ex: C) - acorde básico
- Menor (ex: Cm) - com terça menor
- Aumentado (ex: C+) - quinta aumentada
- Diminuto (ex: C°) - terça e quinta diminutas
- Sexta (ex: C6) - com sexta maior
- Sétima (ex: C7) - sétima da dominante
- Sétima maior (ex: Cmaj7) - com sétima maior
- Menor com sétima (ex: Cm7) - menor com sétima menor

COMO RESPONDER:
1. APENAS responda sobre acordes de cavaquinho e teoria musical relacionada
2. Se perguntarem sobre posições, use referências como "casa X" ou "traste X"
3. Explique digitação quando relevante (qual dedo usar)
4. Sugira variações alternativas quando apropriado
5. Se perguntarem sobre progressões de acordes, ajude com sugestões musicais
6. Se perguntarem sobre outros instrumentos ou assuntos não relacionados, responda: "Desculpe, só posso ajudar com dúvidas sobre acordes de cavaquinho. Como posso te ajudar com isso?"

Seja conciso, amigável e didático. Use termos musicais brasileiros (ex: "casa" em vez de "fret", "traste" em vez de "fret").`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar sua mensagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
