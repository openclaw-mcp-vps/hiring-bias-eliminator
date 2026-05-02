import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BiasAnalyzer } from "@/components/BiasAnalyzer";
import { isAccessTokenValid } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hbe_access")?.value;
  const hasAccess = token ? await isAccessTokenValid(token) : false;

  if (!hasAccess) {
    redirect("/?locked=1");
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-50" style={{ fontFamily: "var(--font-heading)" }}>
          Bias Analysis Dashboard
        </h1>
        <p className="mt-2 text-slate-300">
          Review hiring language before it reaches candidates or performance records.
        </p>
      </div>
      <BiasAnalyzer />
    </main>
  );
}
