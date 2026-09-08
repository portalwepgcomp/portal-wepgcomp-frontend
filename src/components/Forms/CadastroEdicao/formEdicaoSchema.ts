import { z } from "zod";

export const formEdicaoSchema = z.object({
  titulo: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "Nome do evento é obrigatório!"),

  descricao: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "Descrição do evento é obrigatório!"),

  inicio: z
    .string({ invalid_type_error: "Data de início são obrigatórios!" })
    .datetime({ message: "Data inválida!" }),

  final: z
    .string({ invalid_type_error: "Data de fim são obrigatórios!" })
    .datetime({ message: "Data inválida!" }),

  local: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "Local do Evento é obrigatório!"),

  salas: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
      { invalid_type_error: "Campo inválido" },
    )
    .min(1, "Pelo menos uma sala é obrigatória"),

  comissao: z
    .array(
      z.object({
        label: z.string(),
        value: z.string({ invalid_type_error: "Campo inválido!" }),
      }),
    )
    .optional(),

  sessoes: z
    .number({ invalid_type_error: "O número de sessões é obrigatório!" })
    .nonnegative({ message: "O número de sessões não pode ser negativo!" })
    .gt(0, { message: "O número de sessões deve ser maior que 0!" }),

  duracao: z
    .number({ invalid_type_error: "Informar a duração é obrigatório!" })
    .nonnegative({ message: "A duração não pode ser negativa!" })
    .gt(0, { message: "A duração deve ser maior que 0!" }),

  submissao: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "O texto para submissão é obrigatório!"),

  limite: z
    .string({
      invalid_type_error: "A data limite para submissão é obrigatória!",
    })
    .datetime({ message: "Data inválida!" }),
});

export type FormEdicaoSchema = z.infer<typeof formEdicaoSchema>;

export const datepickerClasse =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-sm leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

export function bloquearTeclasInvalidas(
  e: React.KeyboardEvent<HTMLInputElement>,
) {
  const blockedKeys = ["e", "E", "+", "-", ",", "."];
  if (blockedKeys.includes(e.key)) e.preventDefault();
}

export function formatarEntradaNumerica(e: React.FormEvent<HTMLInputElement>) {
  const t = e.currentTarget;
  t.value = t.value.replace(/\D/g, "").replace(/^0+/, "");
}

export function colarApenasNumeros(e: React.ClipboardEvent<HTMLInputElement>) {
  if (!/^\d+$/.test(e.clipboardData.getData("text"))) e.preventDefault();
}
