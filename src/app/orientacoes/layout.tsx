import type { Metadata } from "next";

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
