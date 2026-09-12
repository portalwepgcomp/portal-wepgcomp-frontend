"use client";

import Button from "@/components/UI/Button";
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
          <Button size="lg" variante="outline" onClick={() => router.push("/sessoes")}>
            <ArrowLeft />
            Voltar para Sessões
          </Button>
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
              {[
                { tipo: SessaoTipoEnum["Sessão auxiliar do evento"], titulo: "Sessão Auxiliar / Geral", descricao: "Palestras, intervalos, abertura, mesas redondas ou cerimônias.", Icone: Users },
                { tipo: SessaoTipoEnum["Sessão de apresentações"], titulo: "Sessão de Apresentações", descricao: "Bloco com banca avaliadora e submissões vinculadas de discentes.", Icone: Presentation },
              ].map(({ tipo, titulo, descricao, Icone }) => (
                <div key={tipo} className="flex flex-col items-start gap-2">
                  <Button
                    size="lg"
                    type="button"
                    variante={tipoSessao === tipo ? "secondary" : "outline"}
                    aria-pressed={tipoSessao === tipo}
                    onClick={() => setTipoSessao(tipo)}
                  >
                    <Icone data-icon="inline-start" />
                    {titulo}
                  </Button>
                  <p className="text-xs text-muted leading-relaxed">{descricao}</p>
                </div>
              ))}
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
