"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { registrarErro } from "@/utils/logError";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorProps>) {
  useEffect(() => {
    registrarErro("Erro capturado pelo error boundary do App Router", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Ocorreu um erro inesperado
        </h1>

        <p className="mt-2 text-sm text-muted">
          Desculpe pelo transtorno. Nossa equipe foi notificada e estamos trabalhando para resolver.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-4 max-h-32 overflow-auto rounded-lg bg-muted-light/60 p-3 text-left font-mono text-xs text-red-700">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-muted-light active:scale-95 no-underline"
          >
            <Home className="h-4 w-4" />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
