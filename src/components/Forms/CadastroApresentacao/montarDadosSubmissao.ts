import { SubmissionParams } from "@/models/submission";
import { formatLink } from "@/utils/formatLink";

import type { CadastroFormulario } from "./formCadastroApresentacaoSchema";

interface OpcoesDadosSubmissao {
  arquivoPdf: string;
  eventEditionId: string;
  usuarioId: string;
  /** Status atual da submissão em edição; sem ele a API volta para `Submitted`. */
  status?: string;
}

/**
 * Monta o corpo de create/update da submissão só com os campos aceitos pelo
 * DTO da API (que rejeita propriedades extras como `id`, `createdAt`, `actions`).
 */
export function montarDadosSubmissao(
  data: CadastroFormulario,
  { arquivoPdf, eventEditionId, usuarioId, status }: OpcoesDadosSubmissao,
): SubmissionParams {
  return {
    eventEditionId,
    mainAuthorId: data.apresentador || usuarioId,
    title: data.titulo,
    abstractText: data.resumo,
    advisorId: data.orientador,
    coAdvisor: data.coorientador || "",
    pdfFile: arquivoPdf,
    phoneNumber: data.celular,
    // A escolha reserva a sessão; a posição será definida na alocação.
    proposedPresentationBlockId: data.sessao,
    linkHostedFile: formatLink(data.linkApresentacao || ""),
    ...(status ? { status } : {}),
  };
}
