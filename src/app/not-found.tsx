"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
          <FileQuestion className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Página não encontrada
        </h1>

        <p className="mt-2 text-sm text-muted">
          A página que você está procurando não existe, foi movida ou está temporariamente indisponível.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-95 no-underline"
          >
            <Home className="h-4 w-4" />
            Ir para o Início
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-muted-light active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
