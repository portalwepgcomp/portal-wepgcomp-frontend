import { describe, expect, it } from "@jest/globals";

import { esquemaCadastro } from "@/components/Forms/CadastroApresentacao/formCadastroApresentacaoSchema";
import { sessoesDisponiveisParaCadastro } from "@/components/Forms/CadastroApresentacao/sessoesDisponiveis";
import type { PresentationBlock } from "@/models/session";
import type { Submission } from "@/models/submission";

const edicaoAtual = "edicao-atual";

const sessao = (
  id: string,
  sobrescritas: Partial<PresentationBlock> = {},
): PresentationBlock =>
  ({
    id,
    eventEditionId: edicaoAtual,
    type: "Presentation",
    startTime: "2026-10-01T13:00:00.000Z",
    availablePositionsWithInBlock: [
      { positionWithinBlock: 0, startTime: "2026-10-01T13:00:00.000Z" },
    ],
    ...sobrescritas,
  }) as PresentationBlock;

describe("sessões disponíveis no cadastro de apresentação", () => {
  it("aceita apenas blocos de apresentação da edição atual com vagas e ordena por horário", () => {
    const resultado = sessoesDisponiveisParaCadastro(
      [
        sessao("mais-tarde", { startTime: "2026-10-02T13:00:00.000Z" }),
        sessao("geral", { type: "General" }),
        sessao("outra-edicao", { eventEditionId: "outra-edicao" }),
        sessao("lotada", { availablePositionsWithInBlock: [] }),
        sessao("propostas-lotaram", { availableSubmissionSlots: 0 }),
        sessao("mais-cedo"),
      ],
      edicaoAtual,
    );

    expect(resultado.map(({ id }) => id)).toEqual(["mais-cedo", "mais-tarde"]);
    expect(sessoesDisponiveisParaCadastro(resultado)).toEqual([]);
  });

  it("preserva a sessão atual de uma apresentação já alocada, mesmo sem novas vagas", () => {
    const atual = sessao("atual", { availablePositionsWithInBlock: [] });
    const submission = {
      presentationId: "apresentacao-1",
      block: { id: "atual", title: "Sessão atual" },
    } as Submission;

    expect(
      sessoesDisponiveisParaCadastro([atual], edicaoAtual, submission),
    ).toEqual([atual]);
    expect(
      sessoesDisponiveisParaCadastro([atual], edicaoAtual, {
        proposedPresentationBlockId: "atual",
      } as Submission),
    ).toEqual([atual]);
    expect(
      sessoesDisponiveisParaCadastro([atual], edicaoAtual, {
        proposedPresentationBlockId: "atual",
        status: "Rejected",
      } as Submission),
    ).toEqual([]);
  });

  it("exige uma sessão selecionada por UUID", () => {
    const campo = esquemaCadastro.shape.sessao;

    expect(campo.safeParse("").success).toBe(false);
    expect(campo.safeParse("sessao-inexistente").success).toBe(false);
    expect(
      campo.safeParse("f57982fd-f14b-4e22-a51a-2533f94e4385").success,
    ).toBe(true);
  });
});
