"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface DefinicaoAba {
  valor: string;
  rotulo: string;
  contador?: number;
  desabilitada?: boolean;
}

interface AbasProps {
  valor: string;
  aoMudar: (valor: string) => void;
  abas: DefinicaoAba[];
  rotulo: string;
  className?: string;
  listaClassName?: string;
  children: ReactNode;
}

export function Abas({
  valor,
  aoMudar,
  abas,
  rotulo,
  className,
  listaClassName,
  children,
}: Readonly<AbasProps>) {
  return (
    <Tabs.Root
      value={valor}
      onValueChange={(proximo) => aoMudar(String(proximo))}
      className={className}
    >
      <Tabs.List
        aria-label={rotulo}
        className={cn(
          "relative flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]",
          listaClassName,
        )}
      >
        {abas.map((aba) => (
          <Tabs.Tab
            key={aba.valor}
            value={aba.valor}
            disabled={aba.desabilitada}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800/50 disabled:cursor-not-allowed disabled:opacity-40 data-[active]:border-blue-800 data-[active]:text-blue-800"
          >
            {aba.rotulo}
            {aba.contador !== undefined && (
              <span className="rounded-full bg-muted-light px-1.5 py-px text-[11px] font-semibold tabular-nums text-muted">
                {aba.contador}
              </span>
            )}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

export function AbaPainel({
  valor,
  className,
  children,
}: Readonly<{ valor: string; className?: string; children: ReactNode }>) {
  return (
    <Tabs.Panel value={valor} className={cn("outline-none", className)}>
      {children}
    </Tabs.Panel>
  );
}
