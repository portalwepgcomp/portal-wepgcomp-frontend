import type { Metadata } from "next";

/**
 * Metadados de SEO para o formulário de Cadastro de Participantes.
 */
export const metadata: Metadata = {
  title: "Cadastro de Participante",
  description:
    "Cadastre-se como apresentador de projetos, professor avaliador ou ouvinte no WEPGCOMP.",
};

export default function CadastroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
