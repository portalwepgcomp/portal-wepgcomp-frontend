import type { AcoesItemLista } from "@/features/shared/types";
import { Submission } from "@/models/submission";

/**
 * Item de listagem de apresentações. Reaproveita o tipo global `Submission`
 * e agrega os campos aditivos do back (`actions`, `sessionLabel`).
 */
export type ApresentacaoLista = Submission & {
  actions?: AcoesItemLista;
  sessionLabel?: string | null;
};

export type EscopoApresentacoes = "todas" | "minhas";
