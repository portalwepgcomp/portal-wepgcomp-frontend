"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { registrarErro } from "@/utils/logError";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    registrarErro("Erro capturado pelo global error boundary", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4 text-[#1e293b] font-sans antialiased">
        <div className="mx-auto max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold text-[#0f172a]">
            Erro Crítico no Sistema
          </h1>

          <p className="mt-2 text-sm text-[#64748b]">
            Ocorreu uma falha no carregamento estrutural da aplicação. Por favor, recarregue a página.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F25C05] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar Aplicação
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
