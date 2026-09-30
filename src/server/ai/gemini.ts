/**
 * src/server/ai/gemini.ts
 *
 * Minimal Gemini client over the platform `fetch` (no SDK dependency), using
 * the Interactions API with a JSON schema for structured output:
 * https://ai.google.dev/gemini-api/docs/structured-output
 *
 * Server-only: imported solely by the "use server" AI actions, so the API key
 * never reaches the browser.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

/** Pulls the model's text out of an Interactions API response body. Throws on anything else. */
export function extractText(body: unknown): string {
  const b = body as {
    status?: string;
    steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
  } | null;
  if (b?.status && b.status !== "completed") {
    throw new Error(`Gemini returned status "${b.status}".`);
  }
  const text = (b?.steps ?? [])
    .filter((s) => s?.type === "model_output")
    .flatMap((s) => s.content ?? [])
    .filter((c) => c?.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("");
  if (!text) throw new Error("Gemini returned no text output.");
  return text;
}

/** Google's error text from a response body; errors can arrive wrapped in an array (`[{ error }]`). */
export function apiErrorMessage(body: unknown): string | undefined {
  const b = (Array.isArray(body) ? body[0] : body) as {
    errors?: { message?: string }[];
    error?: { message?: string };
  } | null;
  return b?.errors?.[0]?.message ?? b?.error?.message;
}

/** Sends `input` to Gemini and returns the JSON it produced against `schema` (unvalidated). */
export async function generateJson(input: string, schema: object): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in .env.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input,
      response_format: { type: "text", mime_type: "application/json", schema },
    }),
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  const apiError = apiErrorMessage(body);
  if (!res.ok || apiError) {
    throw new Error(`Gemini request failed (${res.status}): ${apiError ?? res.statusText}`);
  }

  try {
    return JSON.parse(extractText(body));
  } catch (e) {
    throw new Error(e instanceof SyntaxError ? "Gemini returned malformed JSON." : (e as Error).message);
  }
}
