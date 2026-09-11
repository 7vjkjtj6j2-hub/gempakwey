import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";

export const metadata: Metadata = { title: "HQ Control Centre | Gempakwey", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="hq"><header><Link href="/admin">Gempakwey / HQ</Link><span>Semua brand · Satu sistem</span></header><main>{children}</main></div>;
}
