import { describe, expect, it } from "@jest/globals";

import { esquemaCadastro } from "@/components/Forms/CadastroApresentacao/formCadastroApresentacaoSchema";
import {
  sessaoAtualParaCadastro,
  sessoesDisponiveisParaCadastro,
} from "@/components/Forms/CadastroApresentacao/sessoesDisponiveis";
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
        status: "Submitted",
      } as Submission),
    ).toEqual([atual]);
    expect(
      sessoesDisponiveisParaCadastro([atual], edicaoAtual, {
        proposedPresentationBlockId: "atual",
        status: "Rejected",
      } as Submission),
    ).toEqual([]);
  });

  it("prioriza a alocação atual e não libera a proposta antiga de um trabalho alocado", () => {
    const propostaAntiga = sessao("proposta-antiga", {
      availableSubmissionSlots: 0,
    });
    const alocada = sessao("alocada", { availableSubmissionSlots: 0 });
    const submission = {
      status: "Confirmed",
      proposedPresentationBlockId: propostaAntiga.id,
      presentationId: "apresentacao-1",
      block: { id: alocada.id },
    } as Submission;

    expect(sessaoAtualParaCadastro(submission)).toBe(alocada.id);
    expect(
      sessoesDisponiveisParaCadastro(
        [propostaAntiga, alocada],
        edicaoAtual,
        submission,
      ),
    ).toEqual([alocada]);
  });

  it("permite a proposta antiga de um trabalho alocado apenas quando há novas vagas", () => {
    const propostaAntiga = sessao("proposta-antiga", {
      availableSubmissionSlots: 1,
    });
    const submission = {
      status: "Confirmed",
      proposedPresentationBlockId: propostaAntiga.id,
      presentationId: "apresentacao-1",
      block: { id: "alocada" },
    } as Submission;

    expect(
      sessoesDisponiveisParaCadastro([propostaAntiga], edicaoAtual, submission),
    ).toEqual([propostaAntiga]);
    expect(sessaoAtualParaCadastro(submission)).toBe("alocada");
  });

  it.each(["Submitted", "Confirmed"])(
    "preserva a reserva própria não alocada com status %s",
    (status) => {
      const reservada = sessao("reservada", { availableSubmissionSlots: 0 });
      const submission = {
        status,
        proposedPresentationBlockId: reservada.id,
      } as Submission;

      expect(sessaoAtualParaCadastro(submission)).toBe(reservada.id);
      expect(
        sessoesDisponiveisParaCadastro([reservada], edicaoAtual, submission),
      ).toEqual([reservada]);
    },
  );

  it("não oferece reserva rejeitada ou escolha inexistente", () => {
    const lotada = sessao("lotada", { availableSubmissionSlots: 0 });
    expect(
      sessoesDisponiveisParaCadastro([lotada], edicaoAtual, {
        status: "Rejected",
        proposedPresentationBlockId: lotada.id,
      } as Submission),
    ).toEqual([]);
    expect(sessaoAtualParaCadastro(null)).toBe("");
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
