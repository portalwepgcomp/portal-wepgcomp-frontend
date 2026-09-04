import type { Metadata } from "next";

/**
 * Metadados de SEO para a página inicial (Home) do WEPGCOMP.
 */
export const metadata: Metadata = {
  title: "Início",
  description:
    "Portal oficial do WEPGCOMP - Workshop de Pós-Graduação em Computação do Instituto de Computação da UFBA.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
