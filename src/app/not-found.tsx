"use client";

import Button from "@/components/UI/Button";
import Link from "next/link";
import { obterClassesBotao } from "@/lib/estilosBotao";
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
            className={obterClassesBotao("primary")}
          >
            <Home data-icon="inline-start" />
            Ir para o Início
          </Link>

          <Button size="lg"
            type="button"
            onClick={() => window.history.back()}
            variante="outline"
          >
            <ArrowLeft  />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
