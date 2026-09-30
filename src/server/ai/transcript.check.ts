/**
 * Self-check for the AI extraction pipeline's untrusted-input handling.
 * Run: npx tsx src/server/ai/transcript.check.ts
 */

import assert from "node:assert/strict";
import { apiErrorMessage, extractText, generateJson, geminiConfigured } from "./gemini";
import { buildPrompt, MAX_SUGGESTIONS, toSuggestions } from "./transcript";

const KNOWN = "11111111-1111-4111-8111-111111111111";
const transcript = "Interviewer: How was KYC?\nParticipant: It just said   KYC rejected, no reason given. I nearly gave up.";

// Response envelope: text lives in steps[type=model_output].content[type=text].
assert.equal(
  extractText({ status: "completed", steps: [{ type: "user_input" }, { type: "model_output", content: [{ type: "text", text: '{"a":1}' }] }] }),
  '{"a":1}'
);
assert.throws(() => extractText({ status: "failed", steps: [] }), /status "failed"/);
assert.throws(() => extractText({ status: "completed", steps: [] }), /no text output/);

const point = (over: object) => ({
  quote: "KYC rejected, no reason given",
  summary: "Rejections give no reason",
  matchedFindingId: KNOWN,
  title: "Opaque KYC rejections",
  category: "KYC",
  severity: "HIGH",
  ...over,
});

const [matched, invented, unknownId, blankTitle] = toSuggestions(
  {
    painPoints: [
      point({}),
      point({ quote: "The app deleted my money", matchedFindingId: "" }),
      point({ matchedFindingId: "not-a-real-finding" }),
      point({ title: "  ", matchedFindingId: "" }),
      point({ quote: "   " }), // dropped: empty quote
    ],
  },
  transcript,
  new Set([KNOWN])
);
assert.equal(matched.matchedFindingId, KNOWN);
assert.equal(matched.verbatim, true, "whitespace/case differences still count as verbatim");
assert.equal(invented.verbatim, false, "a quote not in the transcript is flagged");
assert.equal(unknownId.matchedFindingId, null, "an id the project doesn't have becomes a new-finding suggestion");
assert.equal(blankTitle.title, "Rejections give no reason", "blank title falls back to the summary");
assert.equal(toSuggestions({ painPoints: [point({}), point({ quote: " " })] }, transcript, new Set()).length, 1);

assert.equal(
  toSuggestions({ painPoints: Array.from({ length: 40 }, () => point({})) }, transcript, new Set()).length,
  MAX_SUGGESTIONS,
  "output is capped"
);
assert.throws(() => toSuggestions({ painPoints: [point({ severity: "APOCALYPTIC" })] }, transcript, new Set()));
assert.throws(() => toSuggestions({ wrong: [] }, transcript, new Set()));

const prompt = buildPrompt(transcript, [{ id: KNOWN, title: "T", description: "D" }]);
assert.ok(prompt.includes(`id: ${KNOWN}`) && prompt.includes("<<<\n" + transcript + "\n>>>"));

// Error bodies: Google's real invalid-key response is wrapped in an array.
const keyError = "API key not valid. Please pass a valid API key.";
assert.equal(apiErrorMessage([{ error: { code: 400, message: keyError, status: "INVALID_ARGUMENT" } }]), keyError);
assert.equal(apiErrorMessage({ error: { message: keyError } }), keyError);
assert.equal(apiErrorMessage({ errors: [{ code: "x", message: keyError }] }), keyError);
assert.equal(apiErrorMessage(null), undefined);

// Missing key: fails with a clear message before any network call.
delete process.env.GEMINI_API_KEY;
assert.equal(geminiConfigured(), false);
assert
  .rejects(generateJson("x", {}), /GEMINI_API_KEY is not set/)
  .then(() => console.log("transcript.check: all assertions passed"));
