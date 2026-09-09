"use client";

import Button from "@/components/UI/Button";
import { Campo } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import type { ApresentacaoOpt } from "./useFormSessaoApresentacoes";

const selectClasse =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-sm leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";


interface ApresentacoesOrdenaveisProps {
  availableOptions: ApresentacaoOpt[];
  orderedApresentacoes: ApresentacaoOpt[];
  addApresentacao: (id: string) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  removeRow: (index: number) => void;
  erro?: string;
}

/**
 * Lista ordenável de apresentações da sessão: select para adicionar + tabela
 * com mover (↑/↓) e excluir. Extraído de `FormSessaoApresentacoes.tsx`.
 */
export default function ApresentacoesOrdenaveis({
  availableOptions,
  orderedApresentacoes,
  addApresentacao,
  moveUp,
  moveDown,
  removeRow,
  erro,
}: Readonly<ApresentacoesOrdenaveisProps>) {
  return (
    <Campo
      label={<span className="font-bold">Apresentações</span>}
      erro={erro}
      className="mb-1"
    >
      <select
        className={cn(selectClasse, "mb-2")}
        id="sa-apresentacoes-add-select"
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return;
          addApresentacao(e.target.value);
          e.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Selecione as apresentações
        </option>
        {availableOptions.map((op) => (
          <option key={op.value} value={op.value}>
            {op.title} ({op.presenterName})
          </option>
        ))}
      </select>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="p-2 align-middle" />
              <th className="w-14 p-2 align-middle">#</th>
              <th className="p-2 align-middle">Título</th>
              <th className="p-2 align-middle">Apresentador</th>
              <th className="w-[220px] p-2 align-middle">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orderedApresentacoes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-muted">
                  Nenhuma apresentação selecionada.
                </td>
              </tr>
            )}
            {orderedApresentacoes.map((row, index) => (
              <tr
                key={`${row.value}-${index}`}
                className="border-b border-line"
              >
                <td className="p-2 align-middle">
                  <div className="mr-2.5 inline-flex gap-1" role="group">
                    <Button size="lg"
                      type="button"
                      variante="secondary"
                      title="Subir"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button size="lg"
                      type="button"
                      variante="secondary"
                      title="Descer"
                      onClick={() => moveDown(index)}
                      disabled={index === orderedApresentacoes.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </td>
                <td className="p-2 align-middle">{index + 1}</td>
                <td className="p-2 align-middle">{row.title}</td>
                <td className="p-2 align-middle">{row.presenterName}</td>
                <td className="p-2 align-middle">
                  <Button size="lg"
                    type="button"
                    variante="danger"
                    title="Excluir"
                    onClick={() => removeRow(index)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Campo>
  );
}
