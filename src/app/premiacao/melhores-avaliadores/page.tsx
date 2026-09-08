"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormMelhorAvaliador } from "@/components/Forms/MelhoresAvaliadores/FormMelhoresAvaliadores";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { PremiacaoProvider } from "@/hooks/usePremiacao";
import { useEdicao } from "@/hooks/useEdicao";
import { cn } from "@/utils/cn";

const headerBtnClass = cn(
  "inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5",
  "text-sm font-semibold text-foreground shadow-sm transition-all duration-200",
  "hover:bg-muted-light hover:border-brand-blue hover:text-brand-blue",
  "[&_svg]:h-4 [&_svg]:w-4",
);

export default function MelhoresAvaliadoresPage() {
  const router = useRouter();
  const { Edicao } = useEdicao();

  return (
    <ProtectedLayout>
      <PremiacaoProvider>
        <Banner title="Avaliadores Destaque" />

        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <button className={headerBtnClass} onClick={() => router.push("/premiacao")}>
              <ArrowLeft />
              Voltar para Premiação
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-start gap-4 border-b border-line pb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Homenagem a Avaliadores Destaque
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    Edição: <strong>{Edicao?.name || "WEPGCOMP"}</strong> — Selecione até 3 membros da banca avaliadora para receberem o reconhecimento oficial do evento.
                  </p>
                </div>
              </div>

              <FormMelhorAvaliador />
            </div>
          </div>
        </main>
      </PremiacaoProvider>
    </ProtectedLayout>
  );
}
