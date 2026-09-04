import { z } from "zod";

/**
 * Schema de validação do formulário de sessão (bloco de apresentação).
 * Extraído de `FormSessaoApresentacoes.tsx`, mesmo padrão do FormEdicao.
 */
export const formSessaoApresentacoesSchema = z.object({
  titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título é obrigatório."),
  apresentacoes: z
    .array(
      z.object({
        label: z.string(),
        value: z.string({
          invalid_type_error: "Campo inválido!",
        }),
      }),
    )
    .optional(),

  n_apresentacoes: z
    .number({
      invalid_type_error: "Campo inválido!",
    })
    .refine((value) => value > 0, {
      message:
        "Número de apresentações é obrigatório e deve ser maior que zero!",
    }),

  sala: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Sala é obrigatória!"),

  inicio: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .datetime({
      message: "Data ou horário inválidos!",
    })
    .min(1, "Data e horário de início são obrigatórios!")
    .nullable(),

  avaliadores: z
    .array(
      z.object({
        label: z.string(),
        value: z.string({
          invalid_type_error: "Campo inválido!",
        }),
      }),
    )
    .optional(),
});

export type FormSessaoApresentacoesSchema = z.infer<
  typeof formSessaoApresentacoesSchema
>;

// --- Helpers puros de input numérico (nº de apresentações) ---

/** Bloqueia teclas que não formam inteiros (e/E/+/-/,/.). */
export function bloquearTeclasInvalidas(
  e: React.KeyboardEvent<HTMLInputElement>,
) {
  const blockedKeys = ["e", "E", "+", "-", ",", "."];
  if (blockedKeys.includes(e.key)) e.preventDefault();
}

/** Remove tudo que não é dígito e zeros à esquerda. */
export function formatarEntradaNumerica(e: React.FormEvent<HTMLInputElement>) {
  const t = e.currentTarget;
  t.value = t.value.replace(/\D/g, "").replace(/^0+/, "");
}

/** Impede colar conteúdo não numérico. */
export function colarApenasNumeros(e: React.ClipboardEvent<HTMLInputElement>) {
  const text = e.clipboardData.getData("text");
  if (!/^\d+$/.test(text)) e.preventDefault();
}
