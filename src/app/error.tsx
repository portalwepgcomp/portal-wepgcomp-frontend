"use client";

import Button from "@/components/UI/Button";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { obterClassesBotao } from "@/lib/estilosBotao";
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
          <Button size="lg"
            type="button"
            onClick={() => reset()}
            variante="primary"
          >
            <RefreshCw  />
            Tentar Novamente
          </Button>

          <Link
            href="/"
            className={obterClassesBotao("outline")}
          >
            <Home data-icon="inline-start" />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
