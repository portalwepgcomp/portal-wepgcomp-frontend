"use client";

import { ArrowLeft, CalendarPlus, Presentation, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import FormSessaoApresentacoes from "@/components/Forms/Sessao/FormSessaoApresentacoes";
import FormSessaoGeral from "@/components/Forms/Sessao/FormSessaoGeral";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { SessaoTipoEnum } from "@/enums/session";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useSessoesQuery } from "@/features/sessoes/hooks/useSessoesQuery";
import { cn } from "@/utils/cn";

const headerBtnClass = cn(
  "inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5",
  "text-sm font-semibold text-foreground shadow-sm transition-all duration-200",
  "hover:bg-muted-light hover:border-brand-blue hover:text-brand-blue",
  "[&_svg]:h-4 [&_svg]:w-4",
);

export default function NovaSessao() {
  const router = useRouter();
  const { setSessao } = useSession();
  const { Edicao } = useEdicao();
  const { sessoes } = useSessoesQuery(Edicao?.id);

  const [tipoSessao, setTipoSessao] = useState<SessaoTipoEnum>(
    SessaoTipoEnum["Sessão auxiliar do evento"],
  );

  useEffect(() => {
    setSessao(null);
  }, [setSessao]);

  const disabledIntervals = useMemo(() => {
    if (!sessoes) return [];
    return sessoes.map((s) => {
      const start = new Date(s.startTime);
      const end = new Date(start.getTime() + (s.duration ?? 0) * 60000);
      return { start, end };
    });
  }, [sessoes]);

  return (
    <ProtectedLayout>
      <Banner title="Nova Sessão" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <button className={headerBtnClass} onClick={() => router.push("/sessoes")}>
            <ArrowLeft />
            Voltar para Sessões
          </button>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-start gap-4 border-b border-line pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Criar Nova Sessão</h1>
              <p className="mt-1 text-sm text-muted">
                Selecione a categoria da sessão e defina os horários, local e apresentações.
              </p>
            </div>
          </div>

          {/* Seletor Visual de Tipo de Sessão */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-bold text-foreground">
              Escolha a modalidade da sessão
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTipoSessao(SessaoTipoEnum["Sessão auxiliar do evento"])}
                className={cn(
                  "flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200",
                  tipoSessao === SessaoTipoEnum["Sessão auxiliar do evento"]
                    ? "border-brand-blue bg-blue-50/50 ring-2 ring-brand-blue/20"
                    : "border-line bg-card hover:border-brand-blue/50 hover:bg-muted-light/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    tipoSessao === SessaoTipoEnum["Sessão auxiliar do evento"]
                      ? "bg-brand-blue text-white"
                      : "bg-muted-light text-muted",
                  )}
                >
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sessão Auxiliar / Geral</h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Palestras, intervalos, abertura, mesas redondas ou cerimônias.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoSessao(SessaoTipoEnum["Sessão de apresentações"])}
                className={cn(
                  "flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200",
                  tipoSessao === SessaoTipoEnum["Sessão de apresentações"]
                    ? "border-brand-blue bg-blue-50/50 ring-2 ring-brand-blue/20"
                    : "border-line bg-card hover:border-brand-blue/50 hover:bg-muted-light/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    tipoSessao === SessaoTipoEnum["Sessão de apresentações"]
                      ? "bg-brand-blue text-white"
                      : "bg-muted-light text-muted",
                  )}
                >
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sessão de Apresentações</h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Bloco com banca avaliadora e submissões vinculadas de discentes.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {tipoSessao === SessaoTipoEnum["Sessão auxiliar do evento"] ? (
            <FormSessaoGeral disabledIntervals={disabledIntervals} />
          ) : (
            <FormSessaoApresentacoes disabledIntervals={disabledIntervals} />
          )}
        </div>
      </main>
    </ProtectedLayout>
  );
}
