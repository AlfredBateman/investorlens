/**
 * prisma/seed.ts
 *
 * Seeds the "Retail Investor UX Research" demo study described in README.md:
 * 14 interviews (ages 22–45, Zerodha / Groww / Upstox / Angel One, Jan–Feb 2025),
 * 3 personas, 5 findings, 8 recommendations and a 7-stage journey map.
 *
 * Run with: npx prisma db seed
 * All participants are fictional.
 */

import type { Prisma } from "@prisma/client";
import { db as prisma } from "../src/lib/db";

type InterviewSeed = Omit<Prisma.InterviewCreateManyInput, "projectId" | "notesText"> & {
  quote: string;
  observations: string[];
};

const INTERVIEWS: InterviewSeed[] = [
  // --- New investors (0–4) ---
  {
    candidateName: "Aarav Mehta",
    candidateRole: "Final-year B.Com student",
    age: 22,
    platform: "GROWW",
    dateConducted: new Date("2025-01-08T10:00:00+05:30"),
    investingBehavior: "Started a ₹500/month index fund SIP three months ago after watching finance reels. Opens the app daily but hasn't bought any stocks yet.",
    goals: "Build an emergency fund and learn stock investing before starting his first job.",
    frustrations: "KYC was rejected twice for a signature mismatch, with no explanation of what was wrong.",
    quote: "It just said 'KYC rejected'. I had to Google what a 'signature mismatch' even meant.",
    observations: [
      "Uploaded a photo of his signature on lined paper; the rejection email gave no guidance.",
      "Completed KYC on the third attempt, 9 days after sign-up.",
      "Relies on Instagram and YouTube for all investing decisions.",
    ],
  },
  {
    candidateName: "Priya Nair",
    candidateRole: "Junior software engineer",
    age: 24,
    platform: "GROWW",
    dateConducted: new Date("2025-01-10T18:30:00+05:30"),
    investingBehavior: "Transferred ₹20,000 to her Groww balance in November; it sat idle for five weeks before she bought anything.",
    goals: "Invest a fixed share of her salary every month without researching every fund.",
    frustrations: "After activation the app showed hundreds of funds and no suggested first step. Didn't understand direct vs regular plans or expense ratios.",
    quote: "The account was ready, the money was in, and then… nothing. I didn't know what the 'right' first thing to buy was.",
    observations: [
      "Scrolled the Explore tab for about four minutes during the session without choosing a fund.",
      "Asked the moderator what 'expense ratio' means.",
      "Said she would trust a short checklist more than app recommendations.",
    ],
  },
  {
    candidateName: "Rohan Deshpande",
    candidateRole: "Sales executive (FMCG)",
    age: 26,
    platform: "UPSTOX",
    dateConducted: new Date("2025-01-13T19:00:00+05:30"),
    investingBehavior: "Joined through a referral bonus. Occasionally buys large-cap stocks on tips from colleagues.",
    goals: "Grow his savings faster than a fixed deposit and eventually try swing trading.",
    frustrations: "Accidentally placed an intraday (MIS) order that was auto-squared off at 3:20 PM, booking an unexpected loss.",
    quote: "I thought I bought the share. Next day it was just gone from my holdings, with a loss and extra charges.",
    observations: [
      "Couldn't explain the difference between CNC/Delivery and MIS/Intraday.",
      "The order screen defaulted to the product type he used last.",
      "Now asks a friend before placing any order.",
    ],
  },
  {
    candidateName: "Sneha Kulkarni",
    candidateRole: "Freelance content writer",
    age: 23,
    platform: "ANGEL_ONE",
    dateConducted: new Date("2025-01-15T11:00:00+05:30"),
    investingBehavior: "Opened an account to invest irregular freelance income; has made two small stock purchases.",
    goals: "Invest whenever a client pays, without a complicated process each time.",
    frustrations: "Video KYC failed four times because of lighting and network drops, and linking her bank through a UPI mandate also failed once.",
    quote: "Every time the video call dropped I had to start from the beginning. I almost gave up.",
    observations: [
      "Took 6 days from sign-up to activation.",
      "No progress indicator showed which KYC step had failed.",
      "Called support twice and waited more than 25 minutes each time.",
    ],
  },
  {
    candidateName: "Kabir Singh",
    candidateRole: "MBA student",
    age: 25,
    platform: "ZERODHA",
    dateConducted: new Date("2025-01-18T16:00:00+05:30"),
    investingBehavior: "Opened a Zerodha account because his classmates use it. Holds three stocks and one ETF bought after finance-club discussions.",
    goals: "Learn fundamental analysis and build a long-term portfolio before graduating.",
    frustrations: "Kite feels built for experienced traders. Terms like P/E, circuit limit and GTT appear without explanation.",
    quote: "Varsity is great, but it's in a different app. When I'm on the order screen I'm on my own.",
    observations: [
      "Kept switching between Kite and a browser to look up terms.",
      "Didn't know what a GTT order was, despite the prominent button.",
      "Values the low brokerage and would stay even though he's frustrated.",
    ],
  },
  // --- Active traders (5–8) ---
  {
    candidateName: "Vikram Rao",
    candidateRole: "Full-time trader (ex-banker)",
    age: 34,
    platform: "ZERODHA",
    dateConducted: new Date("2025-01-21T17:00:00+05:30"),
    investingBehavior: "Trades index options daily and runs a swing-trading portfolio; places 20–40 orders a day.",
    goals: "Execute quickly at market open and keep an accurate view of margin and P&L.",
    frustrations: "Rejected orders show cryptic RMS codes, and the charges breakdown only becomes clear in the next day's contract note.",
    quote: "When an order gets rejected at 9:16, 'RMS: margin exceeds' doesn't tell me how much short I am or what to do.",
    observations: [
      "Uses a spreadsheet to estimate brokerage, STT and exchange charges before large trades.",
      "Had two app freezes at market open in the past month.",
      "Would pay for a faster, clearer experience when orders fail.",
    ],
  },
  {
    candidateName: "Ananya Iyer",
    candidateRole: "Product manager (SaaS)",
    age: 31,
    platform: "UPSTOX",
    dateConducted: new Date("2025-01-24T20:00:00+05:30"),
    investingBehavior: "Swing-trades mid-caps using TradingView charts and places the orders in Upstox; holds positions for 1–4 weeks.",
    goals: "Spend less time switching between tools and reconcile trades easily at tax time.",
    frustrations: "Rejected orders and failed GTT triggers are buried in the order book, and the support chat loops through FAQ bots.",
    quote: "I found out a stop-loss didn't trigger two days later. Nobody told me.",
    observations: [
      "Got no push notification when a GTT trigger failed.",
      "The chatbot couldn't hand an order-specific issue to a human.",
      "Exports her tradebook every month to reconcile in Google Sheets.",
    ],
  },
  {
    candidateName: "Farhan Qureshi",
    candidateRole: "Chartered accountant",
    age: 38,
    platform: "ANGEL_ONE",
    dateConducted: new Date("2025-01-28T19:30:00+05:30"),
    investingBehavior: "Trades stock futures weekly and manages a long-term equity portfolio for his family.",
    goals: "Manage his trading and his family's investments in one place, with clean tax reports.",
    frustrations: "F&O activation needed an income-proof upload that failed twice, and the tax P&L export mixes intraday and delivery trades.",
    quote: "I'm a CA and I still had to rebuild the P&L myself. What does a normal investor do?",
    observations: [
      "Segment activation took 4 days because the first upload failed silently.",
      "Charges on the contract note didn't match the estimate on the order screen.",
      "Would switch platforms for better reporting.",
    ],
  },
  {
    candidateName: "Deepak Joshi",
    candidateRole: "Data analyst",
    age: 29,
    platform: "ZERODHA",
    dateConducted: new Date("2025-02-03T18:00:00+05:30"),
    investingBehavior: "Trades stocks two or three times a week and keeps five watchlists; relies heavily on price alerts.",
    goals: "Catch breakout setups early without watching screens all day.",
    frustrations: "Alerts are limited and fire late during volatile opens, and charges eat into small trades with no clear preview.",
    quote: "I only realised brokerage plus STT wiped out my profit after I looked at the contract note.",
    observations: [
      "Maintains his own charges calculator in Python.",
      "Called slowness at market open his biggest trust issue.",
      "Prefers data-dense screens and dislikes 'simplified' modes.",
    ],
  },
  // --- Passive SIP investors (9–13) ---
  {
    candidateName: "Meera Pillai",
    candidateRole: "School teacher",
    age: 42,
    platform: "GROWW",
    dateConducted: new Date("2025-02-06T16:30:00+05:30"),
    investingBehavior: "Runs three monthly SIPs in index and hybrid funds and checks the app about once a month.",
    goals: "Save for retirement and her daughter's wedding with minimal effort.",
    frustrations: "One SIP silently failed for two months after her bank mandate expired, and absolute returns vs XIRR confuse her.",
    quote: "I thought my SIPs were running. Two instalments just never happened and I only noticed by chance.",
    observations: [
      "Failure notifications went to an old email address.",
      "Couldn't tell whether 12% 'returns' meant per year or in total.",
      "Trusts the app less since the missed SIPs.",
    ],
  },
  {
    candidateName: "Sanjay Gupta",
    candidateRole: "Small business owner (textiles)",
    age: 45,
    platform: "ZERODHA",
    dateConducted: new Date("2025-02-10T12:00:00+05:30"),
    investingBehavior: "Holds direct mutual funds in Coin plus older regular-plan funds bought through his bank. Invests lump sums after good business months.",
    goals: "See the whole family's investments in one place and track progress toward retirement.",
    frustrations: "His holdings are split across Coin, a bank portal and paper statements, so he has to combine them by hand to know his net worth.",
    quote: "Every quarter my son makes an Excel sheet from four different statements. There must be a better way.",
    observations: [
      "Didn't know he could import a CAS (Consolidated Account Statement).",
      "Assumed Coin shows all of his mutual funds.",
      "Wants a single 'am I on track' number.",
    ],
  },
  {
    candidateName: "Lakshmi Venkatesh",
    candidateRole: "HR manager",
    age: 37,
    platform: "GROWW",
    dateConducted: new Date("2025-02-13T19:00:00+05:30"),
    investingBehavior: "Runs goal-based SIPs for her son's education, plus a small ELSS investment for tax saving.",
    goals: "Know whether she's on track for the education goal without having to understand markets.",
    frustrations: "The portfolio screen shows returns several ways (1-day, total, XIRR) with no explanation, and ELSS lock-in dates aren't obvious.",
    quote: "Is 9% good? Bad? I don't know what I'm supposed to compare it with.",
    observations: [
      "Looked for a goal-progress view that doesn't exist.",
      "Didn't know which ELSS units were still locked in.",
      "Would welcome a plain-language monthly summary.",
    ],
  },
  {
    candidateName: "Arjun Bhatia",
    candidateRole: "Resident doctor",
    age: 33,
    platform: "UPSTOX",
    dateConducted: new Date("2025-02-17T21:00:00+05:30"),
    investingBehavior: "Set up two index-fund SIPs a year ago and rarely opens the app because of long hospital shifts.",
    goals: "Invest long term on a 'set and forget' basis, with no maintenance.",
    frustrations: "Got repeated alerts about the SEBI nominee deadline, but the in-app flow needed an Aadhaar OTP e-sign that kept timing out.",
    quote: "I get two minutes between patients. If the OTP times out, I'm done for the day.",
    observations: [
      "Abandoned the nominee update three times.",
      "Worried his account would be frozen but couldn't find a clear deadline in the app.",
      "Prefers email summaries to push notifications.",
    ],
  },
  {
    candidateName: "Neha Sharma",
    candidateRole: "Marketing manager",
    age: 28,
    platform: "GROWW",
    dateConducted: new Date("2025-02-21T18:30:00+05:30"),
    investingBehavior: "Moved from fixed deposits to mutual-fund SIPs last year and invests a fixed ₹10,000 a month.",
    goals: "Beat inflation to build a house down payment within five years.",
    frustrations: "Doesn't know whether to keep, switch or stop underperforming funds, and the comparison tools use jargon like rolling returns and Sharpe ratio.",
    quote: "I don't want to become an expert. I just want to know if I should change anything.",
    observations: [
      "Switched one fund on a friend's advice, then regretted it.",
      "Didn't know switching funds could trigger capital-gains tax.",
      "Would trust a yearly 'portfolio check-up' feature.",
    ],
  },
];

const PERSONAS = [
  {
    name: "New Investor",
    role: "First-time retail investor",
    ageRange: "22–26",
    occupation: "Students and early-career professionals",
    goals: "1. Start investing small amounts safely.\n2. Learn enough to make decisions without relying on social media tips.\n3. Get from sign-up to a first investment quickly.",
    frustrations: "1. KYC rejections and retries with no clear reason.\n2. Doesn't know what to buy once the account is funded.\n3. Jargon (expense ratio, CNC vs MIS, GTT) with no in-context help.",
    interviews: [0, 1, 2, 3, 4],
  },
  {
    name: "Active Trader",
    role: "Frequent stock and F&O trader",
    ageRange: "29–38",
    occupation: "Finance and tech professionals, full-time traders",
    goals: "1. Fast, reliable order execution at market open.\n2. An accurate real-time view of margin, charges and P&L.\n3. Clean trade and tax reports without manual reconciliation.",
    frustrations: "1. Cryptic order rejections (RMS codes) with no next step.\n2. Charges only visible after the trade, in contract notes.\n3. Silent GTT and stop-loss failures, and support that can't escalate.",
    interviews: [5, 6, 7, 8],
  },
  {
    name: "Passive SIP Investor",
    role: "Long-term, goal-based mutual fund investor",
    ageRange: "28–45",
    occupation: "Salaried professionals and small business owners",
    goals: "1. Set up SIPs once and let them run.\n2. Know whether they are on track for goals like retirement or education.\n3. See all family investments in one place.",
    frustrations: "1. Failed SIPs and expired mandates go unnoticed.\n2. Returns shown several ways (absolute, XIRR) without explanation.\n3. Holdings scattered across platforms and statements.",
    interviews: [9, 10, 11, 12, 13],
  },
];

type FindingSeed = Omit<Prisma.FindingCreateManyInput, "projectId" | "interviewId"> & { interview: number };

const FINDINGS: FindingSeed[] = [
  {
    title: "KYC rejections and retries give no actionable guidance",
    category: "KYC",
    severity: "CRITICAL",
    interview: 3,
    description: "4 of 14 participants hit at least one verification failure (signature mismatch, video-KYC drops, income-proof upload, Aadhaar OTP timeouts). Rejection messages don't say what was wrong or how to fix it, and a failed step often restarts the whole flow. Affected participants took up to 9 days to activate, and one nearly abandoned sign-up.",
  },
  {
    title: "New investors stall between account activation and first investment",
    category: "ONBOARDING",
    severity: "HIGH",
    interview: 1,
    description: "Onboarding ends when the account is activated. New investors described funding their account and then not knowing what to do next; one participant's money sat idle for five weeks. Bank-link and UPI-mandate failures add more drop-off points before the first investment.",
  },
  {
    title: "Financial jargon blocks confident investment decisions",
    category: "RESEARCH",
    severity: "MEDIUM",
    interview: 2,
    description: "Terms like expense ratio, CNC vs MIS, P/E, GTT, XIRR and Sharpe ratio appear without in-context explanation. 7 of 14 participants were unsure of at least one core term. Learning content exists but lives outside the decision point, which leads to mistakes such as unintended intraday orders.",
  },
  {
    title: "Portfolio returns are scattered and hard to interpret",
    category: "PORTFOLIO",
    severity: "LOW",
    interview: 10,
    description: "Passive investors can't see all their holdings in one place or tell whether they are on track. Returns are shown as 1-day, absolute and XIRR without explanation, and there's no goal-progress view. Participants work around this with spreadsheets and help from family, so it rarely blocks investing, but it erodes trust over time.",
  },
  {
    title: "Order failures and charges are opaque, and support can't resolve them quickly",
    category: "SUPPORT",
    severity: "HIGH",
    interview: 5,
    description: "Active traders see cryptic rejection codes (e.g. 'RMS: margin exceeds'), silent GTT and stop-loss failures, and charges they only understand from next-day contract notes. Chatbots loop through FAQs instead of escalating order-specific issues. All 4 active traders had built their own calculators or reconciliation sheets.",
  },
];

type RecommendationSeed = Omit<Prisma.RecommendationCreateManyInput, "projectId" | "findingId"> & { finding: number };

const RECOMMENDATIONS: RecommendationSeed[] = [
  {
    finding: 0,
    title: "Pre-submission document checker for KYC",
    priority: "HIGH",
    status: "IN_PROGRESS",
    description: "Check the signature, photo and PAN–Aadhaar name match on the device before submission, with specific fix-it tips (e.g. 'sign on plain white paper'). Target: halve first-attempt KYC rejections.",
  },
  {
    finding: 0,
    title: "Resumable KYC with a plain-language status tracker",
    priority: "HIGH",
    status: "APPROVED",
    description: "Save progress after each step so a dropped video call or OTP timeout resumes where it failed. Show a step-by-step tracker with the expected wait time and the exact reason for any rejection.",
  },
  {
    finding: 1,
    title: "Guided 'first investment' checklist after activation",
    priority: "HIGH",
    status: "PROPOSED",
    description: "After activation, show a 3-step checklist (set a goal → pick a starter index fund or SIP amount → confirm) instead of the full catalogue. Nudge users whose balance has been idle for 7 days.",
  },
  {
    finding: 1,
    title: "Proactive alerts for failed mandates and SIP instalments",
    priority: "MEDIUM",
    status: "COMPLETED",
    description: "Send a push notification, SMS and email the day a mandate expires or an instalment fails, with a one-tap flow to renew the mandate and retry the instalment.",
  },
  {
    finding: 2,
    title: "Inline glossary tooltips at the point of decision",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    description: "Add tap-to-explain tooltips for jargon on order, fund and portfolio screens (CNC/MIS, expense ratio, XIRR, GTT), each linking to deeper learning content.",
  },
  {
    finding: 2,
    title: "Confirm intraday orders for first-time users",
    priority: "HIGH",
    status: "APPROVED",
    description: "When a user with no intraday history selects MIS/Intraday, show a one-time confirmation that explains auto square-off and charges. Default new users to Delivery (CNC).",
  },
  {
    finding: 3,
    title: "Consolidated portfolio via CAS import, with goal tracking",
    priority: "LOW",
    status: "PROPOSED",
    description: "Let users import their CAS to see all their mutual funds in one place, show returns as annualised XIRR with a plain-language explainer, and track progress against named goals.",
  },
  {
    finding: 4,
    title: "Actionable order-rejection messages and a pre-trade charges preview",
    priority: "HIGH",
    status: "PROPOSED",
    description: "Replace RMS codes with plain-language reasons and next steps (e.g. 'Add ₹4,200 margin'), push alerts for failed GTT and stop-loss triggers, show the full charges before an order is placed, and escalate order-specific chats to a human.",
  },
];

// `findings` / `personas` are indexes into FINDINGS / PERSONAS
// (personas: 0 New Investor, 1 Active Trader, 2 Passive SIP Investor).
type StageSeed = Omit<Prisma.JourneyStageCreateManyInput, "journeyMapId" | "position"> & {
  findings: number[];
  personas: number[];
};

const JOURNEY_STAGES: StageSeed[] = [
  { name: "Discover Platform", description: "Chooses a platform based on referrals, influencers and brokerage costs. Decisions are driven by social media and referral bonuses, with no neutral comparison of charges or features.", painType: "UNCERTAINTY", frictionRating: 2, findings: [], personas: [0] },
  { name: "Sign Up", description: "Creates an account with a mobile OTP and email. Largely smooth; no participant reported problems at this stage.", frictionRating: 0, findings: [], personas: [] },
  { name: "KYC", description: "Uploads PAN, Aadhaar and a signature, then completes video or e-sign verification. Rejections come without reasons, retries restart from scratch, and activation takes up to 9 days.", painType: "DELAY", frictionRating: 5, findings: [0], personas: [0, 1, 2] },
  { name: "Fund Account", description: "Links a bank account, sets up a UPI mandate and adds funds. Bank-link and mandate setups fail; money is added, then sits idle with no guidance.", painType: "FRICTION", frictionRating: 4, findings: [1], personas: [0, 2] },
  { name: "Research Investment", description: "Explores stocks and funds to decide what to buy. Jargon appears without explanation, and learning content lives outside the app.", painType: "CONFUSION", frictionRating: 3, findings: [2], personas: [0, 2] },
  { name: "Place Investment", description: "Selects the product type, order type and quantity, then confirms. Product types (CNC vs MIS) are unclear, rejections are cryptic, and charges only appear after the trade.", painType: "UNCERTAINTY", frictionRating: 4, findings: [4, 2], personas: [0, 1] },
  { name: "Track Portfolio", description: "Monitors holdings, returns and SIP status. Returns are shown several ways without explanation, holdings are scattered across platforms, and missed SIPs go unnoticed.", painType: "CONFUSION", frictionRating: 2, findings: [3], personas: [2] },
];

async function main() {
  console.log("Seeding database...");

  // Cascading deletes remove every interview, persona, finding, recommendation and journey map.
  await prisma.project.deleteMany();

  const { id: projectId } = await prisma.project.create({
    data: {
      name: "Retail Investor UX Research — Zerodha vs Groww",
      description: "Interviews with 14 retail investors (ages 22–45) using Zerodha, Groww, Upstox and Angel One, run January–February 2025, to find recurring pain points across onboarding, research, trading and portfolio tracking.",
      status: "ACTIVE",
    },
  });

  const interviews = await prisma.$transaction(
    INTERVIEWS.map(({ quote, observations, ...interview }) =>
      prisma.interview.create({
        data: {
          ...interview,
          projectId,
          notesText: ["### Session notes", ...observations.map((o) => `- ${o}`), "", `> "${quote}"`].join("\n"),
        },
      })
    )
  );

  const personas = await prisma.$transaction(
    PERSONAS.map(({ interviews: idx, ...persona }) =>
      prisma.persona.create({
        data: {
          ...persona,
          projectId,
          interviews: { create: idx.map((i) => ({ interviewId: interviews[i].id })) },
        },
      })
    )
  );

  const findings = await prisma.$transaction(
    FINDINGS.map(({ interview, ...finding }) =>
      prisma.finding.create({ data: { ...finding, projectId, interviewId: interviews[interview].id } })
    )
  );

  await prisma.recommendation.createMany({
    data: RECOMMENDATIONS.map(({ finding, ...rec }) => ({ ...rec, projectId, findingId: findings[finding].id })),
  });

  await prisma.journeyMap.create({
    data: {
      projectId,
      title: "First investment journey",
      description: "End-to-end journey from discovering a platform to tracking a first portfolio, synthesised from all 14 interviews.",
      stages: {
        create: JOURNEY_STAGES.map(({ findings: f, personas: p, ...stage }, position) => ({
          ...stage,
          position,
          findings: { connect: f.map((i) => ({ id: findings[i].id })) },
          personas: { connect: p.map((i) => ({ id: personas[i].id })) },
        })),
      },
    },
  });

  console.log(
    `Seeded 1 project, ${interviews.length} interviews, ${personas.length} personas, ` +
      `${findings.length} findings, ${RECOMMENDATIONS.length} recommendations, ` +
      `1 journey map (${JOURNEY_STAGES.length} stages).`
  );
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
