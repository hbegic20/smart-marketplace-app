import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminListingsPanel } from "@/components/marketplace/admin-listings-panel";
import { LogoutButton } from "@/components/providers/logout-button";

export default async function AdminPage() {
  const token = cookies().get("agent_access_token")?.value;
  if (!token) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <LogoutButton />
      </div>
      <AdminListingsPanel />
      <p className="mt-4 text-sm">
        <Link href="/agent-marketplace" className="underline">Back to Search</Link>
      </p>
    </main>
  );
}
