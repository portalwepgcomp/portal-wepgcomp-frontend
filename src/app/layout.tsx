import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Providers from "@/context";
import { AuthProvider } from "@/context/AuthProvider/authProvider";
import { TokenValidationWrapper } from "@/components/TokenValidationWrapper";
import type { Metadata } from "next";
import "./globals.css";
import "../styles/tailwind.css";

/**
 * Metadados globais de SEO da aplicação (Next.js App Router).
 * Define título padrão com template para as páginas filhas, descrição,
 * palavras-chave e configurações de indexação para buscadores.
 */
export const metadata: Metadata = {
  title: {
    default: "WEPGCOMP | Workshop de Pós-Graduação em Computação - UFBA",
    template: "%s | WEPGCOMP",
  },
  description:
    "Portal oficial do Workshop de Pós-Graduação em Computação (WEPGCOMP) da UFBA. Apresentações de pesquisas, submissões de trabalhos, programação e emissão de certificados.",
  keywords: [
    "WEPGCOMP",
    "PGCOMP",
    "UFBA",
    "Computação",
    "Pós-Graduação",
    "Workshop",
    "Pesquisa Acadêmica",
    "Mestrado",
    "Doutorado",
  ],
  authors: [{ name: "PGCOMP UFBA", url: "https://pgcomp.ufba.br" }],
  creator: "PGCOMP UFBA",
  publisher: "Instituto de Computação - UFBA",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://wepgcomp.dcc.ufba.br",
    title: "WEPGCOMP | Workshop de Pós-Graduação em Computação - UFBA",
    description:
      "Acompanhe o workshop anual de pós-graduação em computação da UFBA: submissões, avaliações, grade de apresentações e anais.",
    siteName: "WEPGCOMP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>
          <Providers>
            <TokenValidationWrapper>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="main-content flex-1 overflow-auto">
                  {children}
                </main>
                <Footer />
              </div>
            </TokenValidationWrapper>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
