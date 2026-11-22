"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FiltrosLogsErro } from "../tipos";
import { filtrosParaUrl, lerFiltrosDaUrl } from "../lib/filtrosUrl";

/** Mudanças nessas chaves não mudam o recorte, então não voltam à página 1. */
const PRESERVAM_PAGINA = new Set<keyof FiltrosLogsErro>([
  "pagina",
  "log",
  "agrupar",
]);

/**
 * A URL é a fonte da verdade: qualquer recorte pode ser compartilhado e o
 * voltar/avançar do navegador funciona.
 */
export function useFiltrosLogsErro() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const consulta = searchParams.toString();

  const filtros = useMemo(
    () => lerFiltrosDaUrl(new URLSearchParams(consulta)),
    [consulta],
  );

  const navegar = useCallback(
    (proximo: FiltrosLogsErro, modo: "push" | "replace" = "replace") => {
      const qs = filtrosParaUrl(proximo);
      const destino = qs ? `${pathname}?${qs}` : pathname;
      if (modo === "push") router.push(destino, { scroll: false });
      else router.replace(destino, { scroll: false });
    },
    [pathname, router],
  );

  const atualizar = useCallback(
    (mudancas: Partial<FiltrosLogsErro>, modo?: "push" | "replace") => {
      const reiniciaPagina = Object.keys(mudancas).some(
        (chave) => !PRESERVAM_PAGINA.has(chave as keyof FiltrosLogsErro),
      );
      navegar(
        { ...filtros, ...(reiniciaPagina && { pagina: 1 }), ...mudancas },
        modo,
      );
    },
    [filtros, navegar],
  );

  const substituir = useCallback(
    (proximo: FiltrosLogsErro) => navegar({ ...proximo, pagina: 1 }, "push"),
    [navegar],
  );

  return { filtros, consulta, atualizar, substituir };
}
