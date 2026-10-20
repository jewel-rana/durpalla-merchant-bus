import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <LoginForm />
    </div>
  );
}
