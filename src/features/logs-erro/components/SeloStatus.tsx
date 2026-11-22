import { cn } from "@/utils/cn";
import type { LogErroResumo, OrigemLog } from "../tipos";
import {
  descricaoStatus,
  ROTULO_ORIGEM,
  tomDoLog,
  type Tom,
} from "../lib/formatacao";

export const ESTILO_TOM: Record<Tom, string> = {
  erro: "bg-error-light/60 text-error-strong ring-error/30",
  alerta: "bg-warning-light text-warning ring-warning/30",
  neutro: "bg-muted-light text-muted ring-line",
};

export const COR_TOM: Record<Tom, string> = {
  erro: "bg-error-strong",
  alerta: "bg-warning",
  neutro: "bg-muted",
};

const ROTULO_ORIGEM_CURTO: Record<OrigemLog, string> = {
  http: "HTTP",
  logger: "Logger",
  cron: "Agendada",
  process: "Processo",
};

interface SeloStatusProps {
  log: Pick<LogErroResumo, "statusCode" | "level" | "source">;
  detalhado?: boolean;
  /** Rótulo curto da origem, para colunas estreitas. */
  compacto?: boolean;
  className?: string;
}

/** Status HTTP quando houver; senão, a origem (tarefa agendada, logger…). */
export default function SeloStatus({
  log,
  detalhado,
  compacto,
  className,
}: Readonly<SeloStatusProps>) {
  const tom = tomDoLog(log);
  const texto = log.statusCode
    ? String(log.statusCode)
    : (compacto ? ROTULO_ORIGEM_CURTO : ROTULO_ORIGEM)[log.source];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        ESTILO_TOM[tom],
        className,
      )}
      title={
        log.statusCode
          ? descricaoStatus(log.statusCode)
          : ROTULO_ORIGEM[log.source]
      }
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", COR_TOM[tom])}
        aria-hidden
      />
      <span className={cn(log.statusCode && "font-mono tabular-nums")}>
        {texto}
      </span>
      {detalhado && log.statusCode && (
        <span className="font-medium opacity-80">
          · {descricaoStatus(log.statusCode)}
        </span>
      )}
    </span>
  );
}

export function SeloMetodo({ metodo }: Readonly<{ metodo: string | null }>) {
  if (!metodo) return null;
  return (
    <span className="inline-flex rounded bg-slate-100 px-1.5 py-px font-mono text-[11px] font-semibold text-slate-700">
      {metodo}
    </span>
  );
}
