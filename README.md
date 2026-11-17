# Assumption Breaker

An AI agent that stress-tests a founder's idea against real-world evidence, **without ever deciding for them**.
Built for the [AI Agents for Founders Challenge, HETIC 2026](https://ai-agents-founders-hetic-26.devpost.com/).

1. The founder describes the idea.
2. The agent lists the riskiest assumptions (desirability, feasibility, viability). **The founder ranks them.**
3. For each kept assumption, the agent searches the web and returns evidence **for and against**, each with a verbatim quote and its link. Quotes are checked word for word against the source in code: an invented quote is dropped. With fewer than 2 pieces of evidence, the agent says "insufficient evidence" instead of guessing.
4. *(in progress)* Interview guide (Mom Test) and bias detector on interview notes.
5. *(in progress)* **The founder writes the verdict**: continue, pivot or stop.

Every run shows its token count. Cost: 0 EUR.

## Free models only

| Role | Provider | Plan |
|---|---|---|
| Main model | `openai/gpt-oss-120b` (open-weight) on Groq | free tier |
| Fallback model | `gemini-3.5-flash-lite` on Google AI Studio | free tier |
| Local option | any model on Ollama | local, no key |
| Web evidence | Tavily | free plan (1,000 searches/month) |
| Forum evidence | Hacker News (Algolia API) | public, no key |

## Run it

```bash
npm install
cp .env.example .env.local   # add your free Groq and Tavily keys (Gemini optional)
npm run pipeline -- examples/meal-prep-students.txt
npm run pipeline -- examples/meal-prep-students.txt --pick 2,4,5   # choose which assumptions to test
```

A typical run: about 1 minute, 7 model calls, 10,000 to 13,000 tokens.

## AI disclosure

The code is written with the help of Claude Code (Anthropic). Claude is **not** used at runtime: the agent only calls the free models listed above.
