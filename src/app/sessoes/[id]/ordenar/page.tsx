"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, GripVertical, Info, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import DraggableList, { DraggedMovement } from "@/components/DraggableList/DraggableList";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { SwapPresentationsOnSession } from "@/models/session";
import { Submission } from "@/models/submission";
import { cn } from "@/utils/cn";

const headerBtnClass = cn(
  "inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5",
  "text-sm font-semibold text-foreground shadow-sm transition-all duration-200",
  "hover:bg-muted-light hover:border-brand-blue hover:text-brand-blue",
  "[&_svg]:h-4 [&_svg]:w-4",
);

export default function OrdenarApresentacoes() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getSessionById, sessao, swapPresentationsOnSession, loadingSessao } = useSession();
  const { Edicao } = useEdicao();
  const [listaOrdenada, setListaOrdenada] = useState<Submission[]>([]);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (id) {
      getSessionById(id);
    }
  }, [id, getSessionById]);

  useEffect(() => {
    const sorted =
      [...(sessao?.presentations ?? [])]
        .sort((a, b) => a.positionWithinBlock - b.positionWithinBlock)
        .map((p) => p.submission)
        .filter((sub): sub is Submission => sub !== null && sub !== undefined) ?? [];
    setListaOrdenada(sorted);
  }, [sessao]);

  const getPresentationId = useMemo(
    () => (submissionId: string): string =>
      sessao?.presentations?.find((p) => p.submissionId === submissionId)?.id ?? "",
    [sessao],
  );

  const handleOnChangeOrder = async (
    data: Submission[],
    draggedMovement: DraggedMovement[],
  ) => {
    if (!sessao?.id || !Edicao?.id) return;

    const swapBodies = draggedMovement
      .map(
        (movement) =>
          ({
            presentation1Id: getPresentationId(movement.fromId),
            presentation2Id: getPresentationId(movement.toId),
          }) as SwapPresentationsOnSession,
      )
      .filter((x) => x.presentation1Id && x.presentation2Id);

    if (swapBodies.length === 0) return;

    const success = await swapPresentationsOnSession(sessao.id, Edicao.id, swapBodies);
    if (success) {
      setListaOrdenada(data);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    }
  };

  return (
    <ProtectedLayout>
      <Banner title="Ordenar Apresentações" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button className={headerBtnClass} onClick={() => router.push("/sessoes")}>
            <ArrowLeft />
            Voltar para Sessões
          </button>

          {salvo && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-emerald-700 border border-emerald-200 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">Ordem atualizada com sucesso!</span>
            </div>
          )}
        </div>

        {loadingSessao ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-line bg-card p-12 shadow-sm">
            <IndicadorDeCarregamento />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Info Card */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                      Sessão de Apresentações
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-foreground truncate">
                    {sessao?.title || "Sessão"}
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    Total de trabalhos: <strong>{listaOrdenada.length}</strong> apresentação(ões)
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50/70 p-4 text-blue-900 border border-blue-100">
                <Info className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
                <p className="text-sm leading-relaxed">
                  Arraste e solte os cards na sequência desejada. A nova ordem cronológica será sincronizada automaticamente com o cronograma oficial do evento.
                </p>
              </div>
            </div>

            {/* Draggable Reorder Section */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Fila de Apresentações
                </h2>
                <span className="text-xs text-muted flex items-center gap-1">
                  <GripVertical className="h-4 w-4" /> Arraste para mover
                </span>
              </div>

              {listaOrdenada.length > 0 ? (
                <div className="reorder-container">
                  <DraggableList<Submission>
                    list={listaOrdenada}
                    labelTitle="title"
                    labelSubtitle="abstract"
                    componentParentId="ordenar-sessao"
                    onChangeOrder={handleOnChangeOrder}
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-line p-12 text-center text-muted">
                  <p className="text-base font-medium">Nenhuma apresentação vinculada a esta sessão.</p>
                  <p className="mt-1 text-xs">Vincule apresentações através da edição de sessão.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
}
