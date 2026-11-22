"use client";

import { useCallback, useEffect, useState } from "react";

export interface VisaoSalva {
  id: string;
  nome: string;
  consulta: string;
}

const CHAVE = "@LogsErro:visoes";

function ler(): VisaoSalva[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    const valor = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(valor) ? valor : [];
  } catch {
    return [];
  }
}

/** Recortes favoritos do admin, guardados só neste navegador. */
export function useVisoesSalvas() {
  const [visoes, setVisoes] = useState<VisaoSalva[]>([]);

  useEffect(() => setVisoes(ler()), []);

  const gravar = useCallback((proximas: VisaoSalva[]) => {
    setVisoes(proximas);
    localStorage.setItem(CHAVE, JSON.stringify(proximas));
  }, []);

  const salvar = useCallback(
    (nome: string, consulta: string) =>
      gravar([
        ...ler(),
        { id: crypto.randomUUID(), nome: nome.trim(), consulta },
      ]),
    [gravar],
  );

  const remover = useCallback(
    (id: string) => gravar(ler().filter((visao) => visao.id !== id)),
    [gravar],
  );

  return { visoes, salvar, remover };
}
