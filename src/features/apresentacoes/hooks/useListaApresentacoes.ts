"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useEdicao } from "@/hooks/useEdicao";
import { useSubmission } from "@/hooks/useSubmission";
import { unwrapPaginatedList, getPaginationMeta } from "@/types/api";
import { useSubmissionsQuery } from "./useSubmissionsQuery";
import type { ApresentacaoLista, EscopoApresentacoes } from "../types";

interface UseListaApresentacoesOptions {
  escopo?: EscopoApresentacoes;
}

/**
 * Estado + ações da listagem de apresentações (feature slice).
 *
 * - Lista via TanStack Query (cache por edição/escopo/busca; busca server-side).
 * - Suporta resposta em array simples ou envelope PaginatedResponse (P3.2).
 * - Criação: "Incluir Apresentação" via prop `criacao` na ListaApresentacoes.
 * - Edição: navega para `/cadastro-apresentacao` com o dado já carregado no
 *   contexto `useSubmission` (sem modais).
 */
export function useListaApresentacoes({
  escopo = "todas",
}: UseListaApresentacoesOptions = {}) {
  const { user } = useAuth();
  const { Edicao } = useEdicao();
  const { setSubmission, deleteSubmissionById } = useSubmission();
  const router = useRouter();
  const queryClient = useQueryClient();

  const eventEditionId = Edicao?.id;
  const edicaoAtiva = !!Edicao?.isActive;

  const [busca, setBusca] = useState("");
  // Adia o termo de busca para não refazer a query a cada tecla.
  const buscaTrim = useDeferredValue(busca).trim();

  // "minhas": Admin vê todas; demais veem só as próprias.
  // "todas": o back já força ownership para Default.
  const mainAuthorId =
    escopo === "minhas" && user?.level !== "Admin" ? user?.id : undefined;

  const { data, isLoading, error, refetch } = useSubmissionsQuery(
    eventEditionId
      ? {
          eventEditionId,
          ...(mainAuthorId ? { mainAuthorId } : {}),
          ...(buscaTrim ? { search: buscaTrim } : {}),
        }
      : undefined,
  );

  const itens = useMemo<ApresentacaoLista[]>(
    () => unwrapPaginatedList(data) as ApresentacaoLista[],
    [data],
  );

  const metaPaginacao = useMemo(() => getPaginationMeta(data), [data]);

  const possuiSubmissaoPropria = useMemo(
    () => itens.some((item) => item.mainAuthorId === user?.id),
    [itens, user?.id],
  );

  // Autor limitado a 1 submissão por edição.
  const ehLimitado =
    escopo === "minhas"
      ? user?.level !== "Admin"
      : user?.level === "Default";
  const criarDesabilitado = ehLimitado && possuiSubmissaoPropria;

  /** Abre o formulário de criação limpando qualquer submissão em contexto. */
  const abrirCriacao = () => {
    setSubmission(null);
  };

  /** Carrega a submissão no contexto e navega para o formulário de edição. */
  const abrirEdicao = (id: string) => {
    const submission = itens.find((item) => item.id === id);
    if (submission) {
      setSubmission(submission);
      router.push("/cadastro-apresentacao");
    }
  };

  const excluir = async (id: string) => {
    await deleteSubmissionById(id);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  return {
    itens,
    total: metaPaginacao.total,
    metaPaginacao,
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
