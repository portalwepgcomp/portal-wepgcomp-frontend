import type { Metadata } from "next";

/**
 * Metadados de SEO para a página de Premiação do WEPGCOMP.
 */
export const metadata: Metadata = {
  title: "Premiação",
  description:
    "Confira os trabalhos e autores premiados nos destaques do Workshop de Pós-Graduação em Computação.",
};

export default function PremiacaoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
