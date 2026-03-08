import { AgentSearchForm } from "@/components/marketplace/agent-search-form";
import Link from "next/link";

export default function AgentMarketplacePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <div className="mb-4 flex gap-4">
        <Link href="/admin" className="text-sm underline">
          Open Admin
        </Link>
        <Link href="/admin/login" className="text-sm underline">
          Admin Login
        </Link>
      </div>
      <AgentSearchForm />
    </main>
  );
}
