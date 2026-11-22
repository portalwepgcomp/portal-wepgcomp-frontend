export interface QuadroPilha {
  texto: string;
  funcao?: string;
  arquivo?: string;
  linha?: number;
  coluna?: number;
  /** Código do projeto (fora de node_modules e do runtime do Node). */
  doProjeto: boolean;
}

export interface PilhaAnalisada {
  cabecalho: string;
  quadros: QuadroPilha[];
}

const COM_FUNCAO = /^at (?:async )?(.+?) \((.+?):(\d+):(\d+)\)$/;
const SEM_FUNCAO = /^at (?:async )?(.+?):(\d+):(\d+)$/;

function caminhoRelativo(arquivo: string): string {
  const normalizado = arquivo.replace(/\\/g, "/");
  const indice = normalizado.search(/\/(src|dist)\//);
  return indice >= 0 ? normalizado.slice(indice + 1) : normalizado;
}

function ehDoProjeto(arquivo: string): boolean {
  const normalizado = arquivo.replace(/\\/g, "/");
  return (
    /\/(src|dist)\//.test(normalizado) &&
    !normalizado.includes("node_modules") &&
    !normalizado.startsWith("node:")
  );
}

export function analisarPilha(pilha: string | undefined): PilhaAnalisada {
  if (!pilha) return { cabecalho: "", quadros: [] };

  const linhas = pilha.split("\n");
  const inicioQuadros = linhas.findIndex((linha) =>
    linha.trim().startsWith("at "),
  );
  const cabecalho = (
    inicioQuadros === -1 ? linhas : linhas.slice(0, inicioQuadros)
  )
    .join("\n")
    .trim();

  const quadros = (inicioQuadros === -1 ? [] : linhas.slice(inicioQuadros))
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map<QuadroPilha>((texto) => {
      const comFuncao = COM_FUNCAO.exec(texto);
      if (comFuncao) {
        const [, funcao, arquivo, linha, coluna] = comFuncao;
        return {
          texto,
          funcao,
          arquivo: caminhoRelativo(arquivo),
          linha: Number(linha),
          coluna: Number(coluna),
          doProjeto: ehDoProjeto(arquivo),
        };
      }
      const semFuncao = SEM_FUNCAO.exec(texto);
      if (semFuncao) {
        const [, arquivo, linha, coluna] = semFuncao;
        return {
          texto,
          arquivo: caminhoRelativo(arquivo),
          linha: Number(linha),
          coluna: Number(coluna),
          doProjeto: ehDoProjeto(arquivo),
        };
      }
      return { texto, doProjeto: false };
    });

  return { cabecalho, quadros };
}

/** Agrupa quadros seguidos de bibliotecas para mostrar recolhidos. */
export function agruparQuadros(
  quadros: QuadroPilha[],
): Array<
  | { doProjeto: true; quadro: QuadroPilha }
  | { doProjeto: false; quadros: QuadroPilha[] }
> {
  const grupos: Array<
    | { doProjeto: true; quadro: QuadroPilha }
    | { doProjeto: false; quadros: QuadroPilha[] }
  > = [];
  for (const quadro of quadros) {
    if (quadro.doProjeto) {
      grupos.push({ doProjeto: true, quadro });
      continue;
    }
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && !ultimo.doProjeto) ultimo.quadros.push(quadro);
    else grupos.push({ doProjeto: false, quadros: [quadro] });
  }
  return grupos;
}
