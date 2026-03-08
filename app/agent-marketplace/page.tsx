import { AgentSearchForm } from "@/components/marketplace/agent-search-form";
import Link from "next/link";

export default function AgentMarketplacePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <div className="mb-4">
        <Link href="/agent-admin" className="text-sm underline">
          Open Admin Listings
        </Link>
      </div>
      <AgentSearchForm />
    </main>
  );
}
