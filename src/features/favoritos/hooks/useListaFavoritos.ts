"use client";

import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { correspondeBusca } from "@/features/shared/texto";
import { useEdicao } from "@/hooks/useEdicao";
import { usePresentation } from "@/hooks/usePresentation";
import { presentationApi } from "@/services/presentation";

export function useListaFavoritos() {
  const { Edicao, loadingEdicao } = useEdicao();
  const { user, signed } = useContext(AuthContext);
  const { deletePresentationBookmark } = usePresentation();
  const eventEditionId = Edicao?.id;
  const [busca, setBusca] = useState("");
  const enabled = !!eventEditionId && !!user?.id && signed && !loadingEdicao;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["presentationBookmarks", user?.id, eventEditionId],
    enabled,
    queryFn: ({ signal }) =>
      presentationApi.getPresentationBookmarks(eventEditionId!, signal),
  });

  const itens = useMemo(() => {
    if (!enabled || isError) return [];
    const lista = data?.bookmarkedPresentations ?? [];
    return lista.filter((item) =>
      correspondeBusca(item.submission?.title ?? "", busca),
    );
  }, [data, busca, enabled, isError]);

  const excluir = async (presentationId: string) => {
    await deletePresentationBookmark({ presentationId });
  };

  return {
    itens,
    total: itens.length,
    isLoading: isLoading || loadingEdicao,
    busca,
    setBusca,
    excluir,
  };
}
