"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

const LARGURAS = {
  md: "sm:max-w-md",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

interface PainelLateralProps {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Conteúdo acima do título (selos, breadcrumbs). */
  topo?: ReactNode;
  acoes?: ReactNode;
  rodape?: ReactNode;
  largura?: keyof typeof LARGURAS;
  children: ReactNode;
}

/**
 * Painel que desliza da direita, sobre o Dialog do Base UI: prende o foco,
 * fecha com Esc e devolve o foco a quem abriu.
 */
export default function PainelLateral({
  aberto,
  aoMudar,
  titulo,
  descricao,
  topo,
  acoes,
  rodape,
  largura = "lg",
  children,
}: Readonly<PainelLateralProps>) {
  return (
    <Dialog.Root open={aberto} onOpenChange={(proximo) => aoMudar(proximo)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-slow data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-[111] flex w-full flex-col bg-card shadow-2xl outline-none",
            "transition-transform duration-slow ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full motion-reduce:transition-none",
            LARGURAS[largura],
          )}
        >
          <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1">
              {topo}
              <Dialog.Title className="m-0 break-words text-lg font-semibold leading-snug text-foreground">
                {titulo}
              </Dialog.Title>
              {descricao && (
                <Dialog.Description className="m-0 mt-1 text-sm text-muted">
                  {descricao}
                </Dialog.Description>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {acoes}
              <Dialog.Close
                aria-label="Fechar painel"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
              >
                <X className="h-5 w-5" aria-hidden />
              </Dialog.Close>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
          {rodape && (
            <footer className="border-t border-line bg-muted-light/60 px-5 py-3 sm:px-6">
              {rodape}
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
