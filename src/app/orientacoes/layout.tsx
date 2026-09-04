import type { Metadata } from "next";

/**
 * Metadados de SEO para a página de Orientações do Evento.
 */
export const metadata: Metadata = {
  title: "Orientações do Evento",
  description:
    "Instruções e diretrizes para autores de trabalhos, professores avaliadores e ouvintes do WEPGCOMP.",
};

export default function OrientacoesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
