// Server Component wrapper — forces dynamic rendering so Vercel CDN
// never serves stale prerendered HTML for the home page.
export const dynamic = "force-dynamic";

import { HomeClient } from "./home-client";

export default function Page() {
  return <HomeClient />;
}
