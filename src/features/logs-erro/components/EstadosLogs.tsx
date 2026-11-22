import { AlertTriangle, PartyPopper, SearchX } from "lucide-react";
import Button from "@/components/UI/Button";
import { cn } from "@/utils/cn";

export function EsqueletoLinhas({ linhas = 8 }: Readonly<{ linhas?: number }>) {
  return (
    <div
      role="status"
      aria-label="Carregando registros"
      className="divide-y divide-line"
    >
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <span className="h-5 w-12 animate-pulse rounded-full bg-muted-light" />
          <span className="h-4 w-20 animate-pulse rounded bg-muted-light" />
          <span className="flex flex-1 flex-col gap-1.5">
            <span className="h-4 w-2/5 animate-pulse rounded bg-muted-light" />
            <span className="h-3 w-3/5 animate-pulse rounded bg-muted-light/70" />
          </span>
          <span className="hidden h-4 w-32 animate-pulse rounded bg-muted-light md:block" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoBloco({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted-light", className)}
      aria-hidden
    />
  );
}

interface EstadoVazioProps {
  comFiltros: boolean;
  aoLimpar: () => void;
  aoAmpliarPeriodo: () => void;
}

export function EstadoVazioLogs({
  comFiltros,
  aoLimpar,
  aoAmpliarPeriodo,
}: Readonly<EstadoVazioProps>) {
  const Icone = comFiltros ? SearchX : PartyPopper;
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
        <Icone className="h-7 w-7 text-primary" aria-hidden />
      </span>
      <h3 className="m-0 text-base font-semibold text-foreground">
        {comFiltros
          ? "Nenhuma falha com esses filtros"
          : "Nenhuma falha neste período"}
      </h3>
      <p className="m-0 max-w-sm text-sm text-muted">
        {comFiltros
          ? "Remova algum filtro ou amplie o período para ver mais registros."
          : "Tudo tranquilo por aqui. Amplie o período para consultar o histórico."}
      </p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {comFiltros && (
          <Button variante="outline" size="sm" onClick={aoLimpar}>
            Limpar filtros
          </Button>
        )}
        <Button variante="ghost" size="sm" onClick={aoAmpliarPeriodo}>
          Ver últimos 30 dias
        </Button>
      </div>
    </div>
  );
}

export function EstadoErroLogs({
  mensagem,
  aoTentar,
}: Readonly<{ mensagem: string; aoTentar: () => void }>) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 px-6 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error-light/60">
        <AlertTriangle className="h-6 w-6 text-error-strong" aria-hidden />
      </span>
      <h3 className="m-0 text-base font-semibold text-foreground">
        Não foi possível carregar os logs
      </h3>
      <p className="m-0 max-w-sm text-sm text-muted">{mensagem}</p>
      <Button variante="outline" size="sm" onClick={aoTentar}>
        Tentar novamente
      </Button>
    </div>
  );
}
