import type { LogErroDetalhe } from "../tipos";
import { formatarDataHora, formatarLocal, ROTULO_ORIGEM } from "./formatacao";

/** Markdown pronto para colar numa issue ou conversa com o time. */
export function resumoParaIssue(log: LogErroDetalhe, link?: string): string {
  const linhas = [
    `### ${log.exceptionName ?? "Erro"}${log.statusCode ? ` (${log.statusCode})` : ""}`,
    "",
    `> ${log.message.split("\n").filter(Boolean).join(" ").slice(0, 500)}`,
    "",
    `- **Quando:** ${formatarDataHora(log.createdAt)} (Brasília)`,
    `- **Origem:** ${ROTULO_ORIGEM[log.source] ?? log.source}`,
  ];

  if (log.method || log.path) {
    linhas.push(
      `- **Requisição:** \`${[log.method, log.path].filter(Boolean).join(" ")}\``,
    );
  }
  const local = formatarLocal(log);
  if (local) {
    linhas.push(
      `- **Local:** \`${local}\`${log.functionName ? ` em \`${log.functionName}\`` : ""}`,
    );
  }
  if (log.prismaCode) linhas.push(`- **Código Prisma:** ${log.prismaCode}`);
  linhas.push(
    `- **Usuário:** ${log.userEmail ? `${log.userEmail} (${log.isAuthenticated ? "autenticado" : "não autenticado"})` : "anônimo"}`,
  );
  if (log.requestId) linhas.push(`- **Request ID:** \`${log.requestId}\``);
  if (link) linhas.push(`- **Registro:** ${link}`);

  const pilha = log.context?.stack;
  if (pilha) {
    linhas.push("", "```", pilha.split("\n").slice(0, 12).join("\n"), "```");
  }

  return linhas.join("\n");
}
