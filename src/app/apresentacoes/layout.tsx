import type { Metadata } from "next";

/**
 * Metadados de SEO para o catálogo de apresentações e trabalhos do WEPGCOMP.
 */
export const metadata: Metadata = {
  title: "Apresentações",
  description:
    "Explore e pesquise todos os trabalhos de mestrado e doutorado apresentados no WEPGCOMP.",
};

export default function ApresentacoesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
