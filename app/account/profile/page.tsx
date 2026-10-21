import type { Metadata } from "next";
import { requireMe } from "@/lib/account";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function Profile() {
  const me = await requireMe("/account/profile");
  return (<div><h1 className="mb-4 text-2xl font-bold">Profile</h1><ProfileForm initial={me} /></div>);
}
