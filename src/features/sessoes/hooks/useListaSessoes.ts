"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { correspondeBusca } from "@/features/shared/texto";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUsers";
import { formatarHorarioSessao } from "../formatarHorario";
import { useSessoesQuery } from "./useSessoesQuery";

/**
 * Estado + ações da listagem de sessões (blocos de apresentação).
 *
 * - Lista via TanStack Query (`useSessoesQuery`) com cache automático por edição.
 * - Mutações no provider `useSession` invalidam a query `["sessions"]`.
 * - Criação e edição navegam para páginas dedicadas (sem modais).
 */
export function useListaSessoes() {
  const { deleteSession, setSessao } = useSession();
  const { getUsers } = useUsers();
  const { Edicao } = useEdicao();
  const router = useRouter();

  const eventEditionId = Edicao?.id;
  const edicaoAtiva = !!Edicao?.isActive;
  const [busca, setBusca] = useState("");

  const { sessoes, isLoading, refetch } = useSessoesQuery(eventEditionId);

  useEffect(() => {
    if (!eventEditionId) return;
    // Pré-carrega dados de professores
    getUsers({ profiles: "Professor" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventEditionId]);

  const itens = useMemo(
    () =>
      [...sessoes.filter((s) => !s.title || correspondeBusca(s.title, busca))]
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )
        .map(formatarHorarioSessao),
    [sessoes, busca],
  );

  const abrirCriacao = () => {
    setSessao(null);
    router.push("/sessoes/nova");
  };

  const abrirEdicao = (id: string) => {
    const sessao = sessoes.find((s) => s.id === id);
    if (sessao) {
      setSessao(sessao);
      router.push(`/sessoes/${id}/editar`);
    }
  };

  const abrirReordenar = (id: string) => {
    const sessao = sessoes.find((s) => s.id === id);
    if (sessao) {
      setSessao(sessao);
      router.push(`/sessoes/${id}/ordenar`);
    }
  };

  const excluir = (id: string) => deleteSession(id, eventEditionId ?? "");

  return {
    itens,
    total: itens.length,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    abrirCriacao,
    abrirEdicao,
    abrirReordenar,
    excluir,
    recarregar: refetch,
  };
}
