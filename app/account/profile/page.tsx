import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function Profile() {
  const me = await api.getProfile();
  return (<div><h1 className="mb-4 text-2xl font-bold">Profile</h1><ProfileForm initial={me} /></div>);
}
