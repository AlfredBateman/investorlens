/**
 * Opt-in AI transcript extraction. Set AI_FEATURES=on in .env to enable the
 * /ai/transcripts route and its nav link; off (the default), the route 404s
 * and nothing else in the app knows it exists.
 */
export const aiEnabled = () => process.env.AI_FEATURES === "on";
