import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessões e Programação",
  description:
    "Grade completa de sessões técnicas, horários, locais e trabalhos agendados no WEPGCOMP.",
};

export default function SessoesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
