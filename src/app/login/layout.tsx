import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse o portal WEPGCOMP com suas credenciais do PGCOMP UFBA.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
