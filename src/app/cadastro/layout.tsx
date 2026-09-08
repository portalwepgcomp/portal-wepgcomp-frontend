import type { Metadata } from "next";

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
