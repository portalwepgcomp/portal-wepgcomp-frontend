"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/**
 * Cria o QueryClient com defaults conservadores para as listagens:
 * - staleTime curto (evita refetch imediato ao navegar entre telas)
 * - sem refetch ao focar a janela (comportamento previsível, como hoje)
 * - 1 retry (rede instável), erros de auth já são tratados pelo interceptor 401.
 */
export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

/**
 * Provider do TanStack Query. Um único QueryClient por sessão do navegador
 * (memoizado via useState). Adotado incrementalmente: por enquanto alimenta as
 * listagens em `features/*`; mutações legadas seguem nos providers atuais.
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
