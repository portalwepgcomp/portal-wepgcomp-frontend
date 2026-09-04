"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useModal } from "@/context/ModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { useEdicao } from "@/hooks/useEdicao";
import { useSubmission } from "@/hooks/useSubmission";
import { submissionApi } from "@/services/submission";
import type { ApresentacaoLista, EscopoApresentacoes } from "../types";

interface UseListaApresentacoesOptions {
  escopo?: EscopoApresentacoes;
}

/**
 * Estado + ações da listagem de apresentações (feature slice).
 *
 * - Lista via TanStack Query (cache por edição/escopo/busca; busca server-side).
 * - Permissão de visibilidade é imposta no back (Default só vê as próprias);
 *   aqui apenas passamos `mainAuthorId` quando o escopo exige.
 * - Mutações (criar/editar/excluir) seguem no provider `useSubmission`, que
 *   invalida esta query ao concluir (ver useSubmission.tsx).
 */
export function useListaApresentacoes({
  escopo = "todas",
}: UseListaApresentacoesOptions = {}) {
  const { user } = useAuth();
  const { Edicao } = useEdicao();
  const { setSubmission, deleteSubmissionById } = useSubmission();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const eventEditionId = Edicao?.id;
  const edicaoAtiva = !!Edicao?.isActive;

  const [busca, setBusca] = useState("");
  // Adia o termo de busca para não refazer a query a cada tecla.
  const buscaTrim = useDeferredValue(busca).trim();

  // "minhas": Superadmin vê todas; demais veem só as próprias.
  // "todas": o back já força ownership para Default.
  const mainAuthorId =
    escopo === "minhas" && user?.level !== "Superadmin" ? user?.id : undefined;

  const { data, isLoading, error, refetch } = useQuery<ApresentacaoLista[]>({
    queryKey: [
      "submissions",
      eventEditionId,
      { escopo, busca: buscaTrim, mainAuthorId },
    ],
    enabled: !!eventEditionId,
    queryFn: () =>
      submissionApi.getSubmissions({
        eventEditionId: eventEditionId as string,
        ...(mainAuthorId ? { mainAuthorId } : {}),
        ...(buscaTrim ? { search: buscaTrim } : {}),
      }),
  });

  const itens = useMemo<ApresentacaoLista[]>(() => data ?? [], [data]);

  const possuiSubmissaoPropria = useMemo(
    () => itens.some((item) => item.mainAuthorId === user?.id),
    [itens, user?.id],
  );

  // Autor limitado a 1 submissão por edição. Em "todas" só o Default é limitado;
  // em "minhas" todos exceto Superadmin (preserva regra atual das duas telas).
  const ehLimitado =
    escopo === "minhas"
      ? user?.level !== "Superadmin"
      : user?.level === "Default";
  const criarDesabilitado = ehLimitado && possuiSubmissaoPropria;

  const abrirCriacao = () => {
    setSubmission(null);
    openModal("editarApresentacaoModal");
  };

  const abrirEdicao = (id: string) => {
    const submission = itens.find((item) => item.id === id);
    if (submission) {
      setSubmission(submission);
      openModal("editarApresentacaoModal");
    }
  };

  const excluir = async (id: string) => {
    await deleteSubmissionById(id);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  return {
    itens,
    total: itens.length,
    isLoading,
    error,
    busca,
    setBusca,
    edicaoAtiva,
    criarDesabilitado,
    abrirCriacao,
    abrirEdicao,
    excluir,
    recarregar: refetch,
  };
}
