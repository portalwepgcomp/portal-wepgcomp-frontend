"use client";

import { useEffect, useMemo, useState } from "react";

import { correspondeBusca } from "@/features/shared/texto";
import { usePresentation } from "@/hooks/usePresentation";

/**
 * Estado + ações da listagem de apresentações favoritas (bookmarks).
 * O `id` de cada item é o presentationId (usado para remover o bookmark).
 */
export function useListaFavoritos() {
  const {
    presentationBookmarks,
    getPresentationBookmarks,
    deletePresentationBookmark,
  } = usePresentation();

  const [busca, setBusca] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPresentationBookmarks().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itens = useMemo(() => {
    const lista = presentationBookmarks?.bookmarkedPresentations ?? [];
    return lista.filter((item) =>
      correspondeBusca(item.submission?.title ?? "", busca),
    );
  }, [presentationBookmarks, busca]);

  const excluir = async (presentationId: string) => {
    await deletePresentationBookmark({ presentationId });
    await getPresentationBookmarks();
  };

  return {
    itens,
    total: itens.length,
    isLoading,
    busca,
    setBusca,
    excluir,
  };
}
