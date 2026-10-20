import Link from "next/link";
export default function NotFound() {
  return <div className="p-20 text-center"><h1 className="text-2xl font-bold">Page not found</h1><Link href="/" className="btn-accent mt-6">Go home</Link></div>;
}
