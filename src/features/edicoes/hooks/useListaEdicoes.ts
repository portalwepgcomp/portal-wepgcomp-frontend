"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useSweetAlert } from "@/hooks/useAlert";
import { useEdicao } from "@/hooks/useEdicao";
import { edicaoApi } from "@/services/edicao";
import { getErrorMessage } from "@/utils/error";
import { registrarErro } from "@/utils/logError";
import type { Edicao as EdicaoType } from "@/models/edicao";
import {
  unwrapPaginatedList,
  getPaginationMeta,
  PaginatedResponse,
} from "@/types/api";

/**
 * Estado + ações da listagem de edições do evento.
 *
 * Lista via React Query (busca server-side).
 * Suporta respostas em array simples ou no envelope PaginatedResponse.
 * `abrirEdicao` agora navega para a página dedicada `/edicoes/[id]/editar`.
 */
export function useListaEdicoes() {
  const { deleteEdicao, Edicao } = useEdicao();
  const { showAlert } = useSweetAlert();
  const router = useRouter();
  const [alternandoInscricoes, setAlternandoInscricoes] = useState(false);

  const [busca, setBusca] = useState("");
  const buscaTrim = useDeferredValue(busca).trim();

  const { data, isLoading, refetch } = useQuery<
    EdicaoType[] | PaginatedResponse<EdicaoType>
  >({
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

  const alternarInscricoes = async (id: string, abrir: boolean) => {
    setAlternandoInscricoes(true);

    try {
      await edicaoApi.setRegistrationOpen(id, abrir);

      // O refetch do react-query v5 resolve com isError em vez de lançar, então
      // sem checar aqui a lista seguiria desatualizada sob um alerta de sucesso.
      const recarga = await refetch();
      const titulo = abrir ? "Inscrições abertas!" : "Inscrições fechadas!";

      if (recarga.isError) {
        showAlert({
          icon: "warning",
          title: titulo,
          text: "A alteração foi salva, mas a lista não pôde ser atualizada. Recarregue a página para ver o estado atual.",
          confirmButtonText: "Entendido",
        });
        return;
      }

      showAlert({
        icon: "success",
        title: titulo,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      registrarErro("Erro ao alternar inscrições", err);

      showAlert({
        icon: "error",
        title: "Erro ao alterar inscrições",
        text: getErrorMessage(
          err,
          "Não foi possível alterar o período de inscrições.",
        ),
        confirmButtonText: "Retornar",
      });
    } finally {
      setAlternandoInscricoes(false);
    }
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
    alternandoInscricoes,
    abrirEdicao,
    alternarInscricoes,
    excluir,
    recarregar: refetch,
  };
}
