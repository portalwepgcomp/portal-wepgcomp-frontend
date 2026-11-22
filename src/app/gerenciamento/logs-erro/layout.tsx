import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs de erro",
  robots: { index: false, follow: false },
};

export default function LogsErroLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
