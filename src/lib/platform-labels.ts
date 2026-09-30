import type { InvestingPlatform } from "@prisma/client";

/** Display label for each InvestingPlatform enum value. Shared by the interview form, card and detail page. */
export const PLATFORM_LABELS: Record<InvestingPlatform, string> = {
  ZERODHA: "Zerodha",
  GROWW: "Groww",
  UPSTOX: "Upstox",
  ANGEL_ONE: "Angel One",
  OTHER: "Other",
};
