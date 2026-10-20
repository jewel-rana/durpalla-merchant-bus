import { AccountNav } from "@/components/AccountNav";
import { api } from "@/lib/api";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const me = await api.getProfile();
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:px-8 lg:grid-cols-[240px_1fr]">
      <aside className="card no-print h-fit min-w-0 p-4">
        <div className="mb-4 hidden items-center gap-3 border-b pb-4 lg:flex">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-light font-bold text-brand">{me.name.split(" ").map((x) => x[0]).join("")}</span>
          <div><p className="font-semibold">{me.name}</p><p className="text-xs text-slate-500">{me.phone}</p></div>
        </div>
        <AccountNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
