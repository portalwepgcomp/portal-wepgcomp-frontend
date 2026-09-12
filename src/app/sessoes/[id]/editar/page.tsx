"use client";

import Button from "@/components/UI/Button";
import { useEffect, useMemo } from "react";
import { ArrowLeft, Calendar, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import FormSessaoApresentacoes from "@/components/Forms/Sessao/FormSessaoApresentacoes";
import FormSessaoGeral from "@/components/Forms/Sessao/FormSessaoGeral";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { SessaoTipoEnum } from "@/enums/session";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useSessoesQuery } from "@/features/sessoes/hooks/useSessoesQuery";

export default function EditarSessao() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getSessionById, sessao, loadingSessao } = useSession();
  const { Edicao } = useEdicao();
  const { sessoes } = useSessoesQuery(Edicao?.id);

  useEffect(() => {
    if (id) {
      getSessionById(id);
    }
  }, [id, getSessionById]);

  const disabledIntervals = useMemo(() => {
    if (!sessoes) return [];
    const outras = sessoes.filter((s) => s.id !== id);
    return outras.map((s) => {
      const start = new Date(s.startTime);
      const end = new Date(start.getTime() + (s.duration ?? 0) * 60000);
      return { start, end };
    });
  }, [sessoes, id]);

  const tipoSessao = sessao?.type ?? SessaoTipoEnum["Sessão auxiliar do evento"];

  return (
    <ProtectedLayout>
      <Banner title="Editar Sessão" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button size="lg" variante="outline" onClick={() => router.push("/sessoes")}>
            <ArrowLeft />
            Voltar para Sessões
          </Button>
        </div>

        {loadingSessao ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-line bg-card p-12 shadow-sm">
            <IndicadorDeCarregamento />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4 border-b border-line pb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Editar Sessão</h1>
                <p className="mt-1 text-sm text-muted">
                  Atualize os detalhes de agendamento, horários e apresentações vinculadas.
                </p>
              </div>
            </div>

            {/* Tipo de Sessão */}
            <div className="mb-8 rounded-xl bg-muted-light/40 p-4 border border-line">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Tipo de Sessão (Definido na Criação)
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-sm font-semibold text-foreground border border-line shadow-xs">
                  <Layers className="h-4 w-4 text-brand-blue" />
                  {sessao?.type === "Presentation"
                    ? "Sessão de Apresentações"
                    : "Sessão Auxiliar / Geral"}
                </span>
              </div>
            </div>

            {tipoSessao === SessaoTipoEnum["Sessão auxiliar do evento"] ? (
              <FormSessaoGeral disabledIntervals={disabledIntervals} />
            ) : (
              <FormSessaoApresentacoes disabledIntervals={disabledIntervals} />
            )}
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
}
