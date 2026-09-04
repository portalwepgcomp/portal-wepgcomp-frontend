import type { Metadata } from "next";

/**
 * Metadados de SEO para o histórico de Edições do WEPGCOMP.
 */
export const metadata: Metadata = {
  title: "Edições do Evento",
  description:
    "Consulte as edições atuais e anteriores do Workshop de Pós-Graduação em Computação (WEPGCOMP).",
};

export default function EdicoesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
