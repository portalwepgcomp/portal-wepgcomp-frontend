"use client";

import { useEffect, useRef } from "react";

interface Acoes {
  focarBusca: () => void;
  proximo: () => void;
  anterior: () => void;
  abrirSelecionado: () => void;
  atualizar: () => void;
  alternarAjuda: () => void;
}

function digitando(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  return (
    alvo.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName) ||
    !!alvo.closest("[role='dialog']")
  );
}

/** `/` busca, `j`/`k` navegam, `Enter` abre, `r` atualiza, `?` mostra os atalhos. */
export function useAtalhosLogsErro(acoes: Acoes) {
  const ref = useRef(acoes);
  ref.current = acoes;

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (
        evento.ctrlKey ||
        evento.metaKey ||
        evento.altKey ||
        digitando(evento.target)
      )
        return;

      const mapa: Record<string, () => void> = {
        "/": ref.current.focarBusca,
        j: ref.current.proximo,
        k: ref.current.anterior,
        Enter: ref.current.abrirSelecionado,
        r: ref.current.atualizar,
        "?": ref.current.alternarAjuda,
      };
      const acao = mapa[evento.key];
      if (!acao) return;
      if (evento.key === "Enter" && evento.target instanceof HTMLButtonElement)
        return;
      evento.preventDefault();
      acao();
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);
}
