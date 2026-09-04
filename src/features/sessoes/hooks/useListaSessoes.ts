"use client";

import { useEffect, useMemo, useState } from "react";

import { useModal } from "@/context/ModalProvider";
import { correspondeBusca } from "@/features/shared/texto";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useSubmission } from "@/hooks/useSubmission";
import { useUsers } from "@/hooks/useUsers";
import { formatarHorarioSessao } from "../formatarHorario";

/**
 * Estado + ações da listagem de sessões (blocos de apresentação).
 *
 * Continua sobre o provider `useSession` (a troca de ordem recarrega a lista
 * de forma acoplada ao provider); a feature só adiciona busca/ordenação/format
 * e abertura de modais — mesmo padrão do reference `GerenciarUsuario`.
 */
export function useListaSessoes() {
  const {
    listSessions,
    sessoesList,
    deleteSession,
    setSessao,
    loadingSessoesList,
  } = useSession();
  const { getUsers } = useUsers();
  const { getSubmissions } = useSubmission();
  const { Edicao } = useEdicao();
  const { openModal } = useModal();

  const eventEditionId = Edicao?.id;
  const edicaoAtiva = !!Edicao?.isActive;
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!eventEditionId) return;
    // Pré-carrega dados que os modais de sessão consomem (professores como
    // avaliadores e submissões ainda sem apresentação alocada).
    listSessions(eventEditionId);
    getUsers({ profiles: "Professor" });
    getSubmissions({ eventEditionId, withouPresentation: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventEditionId]);

  const itens = useMemo(
    () =>
      sessoesList
        .filter((s) => !s.title || correspondeBusca(s.title, busca))
        .toSorted(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )
        .map(formatarHorarioSessao),
    [sessoesList, busca],
  );

  const abrirCriacao = () => {
    setSessao(null);
    openModal("sessaoModal");
  };

  const abrirEdicao = (id: string) => {
    const sessao = sessoesList.find((s) => s.id === id);
    if (sessao) {
      setSessao(sessao);
      openModal("sessaoModal");
    }
  };

  const abrirReordenar = (id: string) => {
    const sessao = sessoesList.find((s) => s.id === id);
    if (sessao) {
      setSessao(sessao);
      openModal("trocarOrdemApresentacao");
    }
  };

  const excluir = (id: string) => deleteSession(id, eventEditionId ?? "");

  return {
    itens,
    total: itens.length,
    isLoading: loadingSessoesList,
    busca,
    setBusca,
    edicaoAtiva,
    abrirCriacao,
    abrirEdicao,
    abrirReordenar,
    excluir,
  };
}
