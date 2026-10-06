import { describe, expect, it } from "@jest/globals";

import type { CadastroFormulario } from "@/components/Forms/CadastroApresentacao/formCadastroApresentacaoSchema";
import { montarDadosSubmissao } from "@/components/Forms/CadastroApresentacao/montarDadosSubmissao";

const CAMPOS_DO_DTO = [
  "abstractText",
  "advisorId",
  "coAdvisor",
  "eventEditionId",
  "linkHostedFile",
  "mainAuthorId",
  "pdfFile",
  "phoneNumber",
  "proposedPresentationBlockId",
  "status",
  "title",
];

const formulario: CadastroFormulario = {
  id: "sub-1",
  titulo: "Meu trabalho",
  sessao: "22222222-2222-4222-8222-222222222222",
  resumo: "Resumo do trabalho",
  apresentador: "autor-1",
  orientador: "11111111-1111-4111-8111-111111111111",
  coorientador: "",
  celular: "71991234567",
  slide: "antigo.pdf",
  linkApresentacao: "",
};

describe("montarDadosSubmissao", () => {
  it("envia apenas campos aceitos pela API, sem id nem dados da listagem", () => {
    const dados = montarDadosSubmissao(formulario, {
      arquivoPdf: "novo.pdf",
      eventEditionId: "edicao-1",
      usuarioId: "usuario-1",
      status: "Confirmed",
    });

    expect(Object.keys(dados).sort()).toEqual(CAMPOS_DO_DTO);
    expect(dados).not.toHaveProperty("id");
    expect(dados.pdfFile).toBe("novo.pdf");
    expect(dados.proposedPresentationBlockId).toBe(formulario.sessao);
    expect(dados).not.toHaveProperty("proposedPositionWithinBlock");
    expect(dados.status).toBe("Confirmed");
  });

  it("omite o status em uma submissão nova", () => {
    const dados = montarDadosSubmissao(formulario, {
      arquivoPdf: "novo.pdf",
      eventEditionId: "edicao-1",
      usuarioId: "usuario-1",
    });

    expect(dados).not.toHaveProperty("status");
  });

  it("usa o usuário logado como autor quando não há apresentador", () => {
    const dados = montarDadosSubmissao(
      { ...formulario, apresentador: "" },
      {
        arquivoPdf: "novo.pdf",
        eventEditionId: "edicao-1",
        usuarioId: "usuario-1",
      },
    );

    expect(dados.mainAuthorId).toBe("usuario-1");
  });
});
