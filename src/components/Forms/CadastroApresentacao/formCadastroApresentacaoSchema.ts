import { z } from "zod";

/**
 * Schema de validação do cadastro/edição de apresentação (submissão).
 * Extraído de `FormCadastroApresentacao.tsx` (mesma quebra feita em FormEdicao).
 * Preserva as regras: título/resumo obrigatórios, orientador UUID, celular
 * 10–11 dígitos, slide PDF obrigatório e link Google Drive/Docs validado.
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
  celular: z.string().refine((value) => {
    const celularFormatado = value.replace(/\D/g, "");
    return celularFormatado.length >= 10 && celularFormatado.length <= 11;
  }, "O celular deve conter 10 ou 11 dígitos"),
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
