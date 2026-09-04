"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useEdicao } from "@/hooks/useEdicao";
import { edicaoApi } from "@/services/edicao";
import type { Edicao as EdicaoType } from "@/models/edicao";
import { unwrapPaginatedList, getPaginationMeta, PaginatedResponse } from "@/types/api";

/**
 * Estado + ações da listagem de edições do evento.
 *
 * Lista via React Query (busca server-side).
 * Suporta respostas em array simples ou no envelope PaginatedResponse.
 * `abrirEdicao` agora navega para a página dedicada `/edicoes/[id]/editar`.
 */
export function useListaEdicoes() {
  const { deleteEdicao, Edicao } = useEdicao();
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const buscaTrim = useDeferredValue(busca).trim();

  const { data, isLoading, refetch } = useQuery<EdicaoType[] | PaginatedResponse<EdicaoType>>({
    queryKey: ["editions", buscaTrim],
    queryFn: () => edicaoApi.listEdicao(buscaTrim || undefined),
  });

  const itens = useMemo<EdicaoType[]>(
    () => unwrapPaginatedList(data) as EdicaoType[],
    [data],
  );

  const metaPaginacao = useMemo(() => getPaginationMeta(data), [data]);
  const edicaoAtiva = !!Edicao?.isActive;

  const abrirEdicao = (id: string) => {
    router.push(`/edicoes/${id}/editar`);
  };

  const excluir = async (id: string) => {
    const status = await deleteEdicao(id);
    if (status) refetch();
  };

  return {
    itens,
    total: metaPaginacao.total,
    metaPaginacao,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    abrirEdicao,
    excluir,
    recarregar: refetch,
  };
}
