import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heritage | Gempakwey",
  description: "Heritage. Kedai pertama dalam keluarga Gempakwey. Akan datang.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ms"><body>{children}</body></html>;
}
