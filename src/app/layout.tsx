import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

/**
 * src/app/layout.tsx  — Root Layout
 *
 * The single root layout wraps every page in the application.
 * Responsibilities:
 *  - Inject the Inter font via next/font (zero CLS, self-hosted by Next.js).
 *  - Set the site-wide <html> and <body> base styles.
 *  - Export global SEO metadata used as a default for all routes.
 *
 * Feature-specific layouts (e.g. sidebar + topbar shell) are added as nested
 * layouts inside the `(app)` route group so this root layout stays lean.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// DESIGN.md display serif: Cormorant Garamond 500 substitutes for the licensed Copernicus face.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InvestorLens",
    template: "%s | InvestorLens",
  },
  description:
    "InvestorLens — the UX Research Management Platform for researchers, product managers, and startup founders.",
  keywords: ["UX Research", "User Research", "Research Management", "Product Management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
