import { z } from "zod";

// Every provider below is reached through its OpenAI-compatible endpoint and
// only on a free plan (Groq free tier, Gemini free tier) or locally (Ollama).
// The order in LLM_PROVIDERS is the fallback chain.

export type ProviderName = "groq" | "gemini" | "ollama";

type Provider = {
  name: ProviderName;
  baseUrl: string;
  model: string;
  apiKey?: string;
};

export type Usage = {
  provider: ProviderName;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function configuredProviders(): Provider[] {
  const all: Record<ProviderName, Provider | null> = {
    groq: process.env.GROQ_API_KEY
      ? {
          name: "groq",
          baseUrl: "https://api.groq.com/openai/v1",
          model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
          apiKey: process.env.GROQ_API_KEY,
        }
      : null,
    gemini: process.env.GEMINI_API_KEY
      ? {
          name: "gemini",
          baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
          model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
          apiKey: process.env.GEMINI_API_KEY,
        }
      : null,
    ollama: process.env.OLLAMA_MODEL
      ? {
          name: "ollama",
          baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
          model: process.env.OLLAMA_MODEL,
        }
      : null,
  };
  const order = (process.env.LLM_PROVIDERS ?? "groq,gemini,ollama")
    .split(",")
    .map((s) => s.trim()) as ProviderName[];
  return order.map((n) => all[n]).filter((p): p is Provider => p !== null);
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly waitMs = 0,
  ) {
    super(message);
  }
}

// Free tiers cap tokens per minute. When the provider says "try again in Xs"
// and X is short, waiting is cheaper than falling back to a weaker model.
const MAX_WAIT_MS = 30_000;

function retryDelayMs(res: Response, body: string): number {
  const header = Number(res.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) return header * 1000;
  const m = body.match(/try again in ([\d.]+)s/i);
  return m ? Math.ceil(Number(m[1]) * 1000) : 0;
}

async function callProvider(
  p: Provider,
  messages: ChatMessage[],
): Promise<{ text: string; usage: Usage }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callProviderOnce(p, messages);
    } catch (e) {
      const wait = e instanceof ProviderError ? e.waitMs : 0;
      if (attempt >= 2 || wait === 0 || wait > MAX_WAIT_MS) throw e;
      await new Promise((r) => setTimeout(r, wait + 500));
    }
  }
}

async function callProviderOnce(
  p: Provider,
  messages: ChatMessage[],
): Promise<{ text: string; usage: Usage }> {
  let res: Response;
  try {
    res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: p.model,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
        // gpt-oss models think before answering; "low" keeps tokens (and quota) down.
        ...(p.model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new ProviderError(`${p.name}: network error (${(e as Error).message})`, true);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    // 429 = free quota reached, 5xx = provider down: both move on to the next provider.
    const retryable = res.status === 429 || res.status >= 500;
    const waitMs = res.status === 429 ? retryDelayMs(res, body) : res.status >= 500 ? 3000 : 0;
    throw new ProviderError(`${p.name}: HTTP ${res.status} ${body}`, retryable, waitMs);
  }
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    usage: {
      provider: p.name,
      model: p.model,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in model output");
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Ask for a JSON answer and validate it against `schema`.
 * Falls through the provider chain on quota/outage errors, and gives the same
 * provider one corrective retry when the JSON does not match the schema.
 */
export async function chatJson<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
): Promise<{ data: T; usage: Usage[] }> {
  const providers = configuredProviders();
  if (providers.length === 0) {
    throw new Error("No LLM provider configured: set GROQ_API_KEY, GEMINI_API_KEY or OLLAMA_MODEL");
  }
  const usage: Usage[] = [];
  const errors: string[] = [];

  for (const p of providers) {
    let convo = messages;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const { text, usage: u } = await callProvider(p, convo);
        usage.push(u);
        let parsed: unknown;
        try {
          parsed = extractJson(text);
        } catch (e) {
          parsed = { __parseError: (e as Error).message };
        }
        const result = schema.safeParse(parsed);
        if (result.success) return { data: result.data, usage };
        convo = [
          ...messages,
          { role: "assistant", content: text },
          {
            role: "user",
            content: `Your JSON did not match the required format:\n${z.prettifyError(result.error)}\nReturn the corrected JSON only.`,
          },
        ];
      }
      errors.push(`${p.name}: invalid JSON after retry`);
    } catch (e) {
      errors.push((e as Error).message);
      if (e instanceof ProviderError && !e.retryable) break;
    }
  }
  throw new Error(`All LLM providers failed: ${errors.join(" | ")}`);
}
