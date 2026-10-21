import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/site";

type P = { params: Promise<{ key: string }> };
const title = (k: string) => k.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: title((await params).key) };
}

/** Merchant policies from `config.policies` (text or HTML authored by the merchant). */
export default async function PolicyPage({ params }: P) {
  const { key } = await params;
  const m = await getSite();
  const body = m.policies[key];
  if (!body) notFound();
  // Rendered as text (tags stripped) so merchant-authored content cannot inject script.
  const text = body.replace(/<br\s*\/?>|<\/p>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="mb-6 text-2xl font-bold">{title(key)}</h1>
      <div className="whitespace-pre-line text-slate-700">{text}</div>
    </article>
  );
}
