"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useModal } from "@/context/ModalProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { edicaoApi } from "@/services/edicao";

/**
 * Estado + ações da listagem de edições do evento.
 *
 * Lista via React Query (busca server-side). A edição selecionada para editar
 * é mantida localmente e passada ao `ModalEditarEdicao` (que recebe por prop,
 * diferente dos demais modais que leem estado global).
 */
export function useListaEdicoes() {
  const { deleteEdicao, Edicao } = useEdicao();
  const { openModal } = useModal();

  const [busca, setBusca] = useState("");
  const buscaTrim = useDeferredValue(busca).trim();
  const [edicaoSelecionada, setEdicaoSelecionada] = useState<Edicao | null>(
    null,
  );

  const { data, isLoading, refetch } = useQuery<Edicao[]>({
    queryKey: ["editions", buscaTrim],
    queryFn: () => edicaoApi.listEdicao(buscaTrim || undefined),
  });

  const itens = data ?? [];
  const edicaoAtiva = !!Edicao?.isActive;

  const abrirEdicao = (id: string) => {
    const edicao = itens.find((e) => e.id === id);
    if (edicao) {
      setEdicaoSelecionada(edicao);
      openModal("editarEdicaoModal");
    }
  };

  const excluir = async (id: string) => {
    const status = await deleteEdicao(id);
    if (status) refetch();
  };

  return {
    itens,
    total: itens.length,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    edicaoSelecionada,
    abrirEdicao,
    excluir,
  };
}
