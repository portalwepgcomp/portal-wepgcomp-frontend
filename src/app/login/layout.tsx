import type { Metadata } from "next";

/**
 * Metadados de SEO para a página de Login.
 * O Next.js mescla automaticamente com o template do layout raiz.
 */
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
