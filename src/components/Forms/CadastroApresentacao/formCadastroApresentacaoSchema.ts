import { z } from "zod";

/**
 * Schema de validação do cadastro/edição de apresentação (submissão).
 * Extraído de `FormCadastroApresentacao.tsx` (mesma quebra feita em FormEdicao).
 * Valida título/resumo, orientador, celular com DDD, slide PDF e link.
 */
export const esquemaCadastro = z.object({
  id: z.string().optional(),
  titulo: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "O título é obrigatório"),
  resumo: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "O resumo é obrigatório"),
  apresentador: z.string({ invalid_type_error: "Campo Inválido" }).optional(),
  orientador: z
    .string({ invalid_type_error: "Campo Inválido" })
    .uuid({ message: "O orientador é obrigatório" }),
  coorientador: z.string().optional(),
  data: z.string().optional(),
  celular: z.string().superRefine((value, context) => {
    const digitos = value.replace(/\D/g, "");
    let message: string | undefined;

    const formatoValido = /^(?:\d{11}|\(\d{2}\) \d{5}-\d{4})$/.test(value);

    if (digitos.length !== 11 || !formatoValido) {
      message = "Informe um celular com DDD e 9 dígitos";
    } else if (digitos[2] !== "9") {
      message = "O celular deve começar com 9 após o DDD";
    } else if (
      digitos
        .slice(3)
        .split("")
        .every((digit) => digit === digitos[3])
    ) {
      message = "O celular não pode ter todos os números iguais";
    }

    if (message) {
      context.addIssue({ code: z.ZodIssueCode.custom, message });
    }
  }),
  slide: z
    .string({ invalid_type_error: "Campo Inválido" })
    .refine((val) => val && val.trim().length > 0, {
      message: "O envio do slide em PDF é obrigatório",
    }),
  linkApresentacao: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^https:\/\/(drive\.google\.com\/(file\/d\/[\w-]+(\/.*)?|open\?id=[\w-]+|uc\?id=[\w-]+|drive\/folders\/[\w-]+(\/.*)?)|docs\.google\.com\/presentation\/d\/[\w-]+(\/.*)?)$/i.test(
          val,
        ),
      {
        message:
          "Insira um link válido do Google Drive ou Google Docs Apresentações (arquivo deve ser um PDF ou apresentação)",
      },
    ),
});

export type CadastroFormulario = z.infer<typeof esquemaCadastro>;
