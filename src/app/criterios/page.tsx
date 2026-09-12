"use client";

import Button from "@/components/UI/Button";
import { ArrowLeft, Award, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import FormCriterios from "@/components/Forms/Criterios/FormCriterios";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { useEdicao } from "@/hooks/useEdicao";

export default function CriteriosPage() {
  const router = useRouter();
  const { Edicao } = useEdicao();

  return (
    <ProtectedLayout>
      <Banner title="Critérios de Avaliação" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button size="lg" variante="outline" onClick={() => router.push("/gerenciamento")}>
            <ArrowLeft />
            Voltar para Gerenciamento
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Critérios de Avaliação
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Edição: <strong>{Edicao?.name || "WEPGCOMP"}</strong> — Defina os 5 quesitos que compõem o formulário de notas dos avaliadores.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50/70 p-4 text-amber-900 border border-amber-200/60">
              <HelpCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-sm leading-relaxed">
                Cada critério cadastrado abaixo será avaliado pela banca examinadora através de uma escala de 1 a 5 estrelas. Os títulos e enunciados devem ser claros para orientar a pontuação de cada apresentação.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <FormCriterios />
          </div>
        </div>
      </main>
    </ProtectedLayout>
  );
}
