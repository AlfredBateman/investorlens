import { redirect } from "next/navigation";

/**
 * src/app/page.tsx — Root redirect
 *
 * The app entry point is the Dashboard. We immediately redirect `/` to
 * `/dashboard` so the URL is semantic. This is a Server Component redirect
 * (no JS needed on the client).
 */
export default function RootPage() {
  redirect("/dashboard");
}
