import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Providers from "@/context";
import "bootstrap-icons/font/bootstrap-icons.css";
import type { Metadata } from "next";
import "./globals.css";
import "../styles/tailwind.css";
import { AuthProvider } from "@/context/AuthProvider/authProvider";
import { TokenValidationWrapper } from "@/components/TokenValidationWrapper";

export const metadata: Metadata = {
  title: "WEPGCOMP",
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
