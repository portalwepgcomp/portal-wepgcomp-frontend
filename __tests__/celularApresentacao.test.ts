import { describe, expect, it } from "@jest/globals";
import { esquemaCadastro } from "@/components/Forms/CadastroApresentacao/formCadastroApresentacaoSchema";

const celular = esquemaCadastro.shape.celular;

describe("Celular de contato da apresentação", () => {
  it.each(["(71) 98888-7777", "71988887777"])(
    "aceita celular válido: %s",
    (numero) => {
      expect(celular.safeParse(numero).success).toBe(true);
    },
  );

  it.each([
    ["(26) 98888-7777", "O DDD deve ser 71"],
    ["(00) 00000-0000", "O DDD deve ser 71"],
    ["(71) 38888-7777", "O celular deve começar com 9 após o DDD"],
    ["(71) 99999-9999", "O celular não pode ter todos os números iguais"],
    ["(71) 90000-0000", "O celular não pode ter todos os números iguais"],
    ["(71) 9888-7777", "Informe um celular com DDD e 9 dígitos"],
  ])("rejeita %s", (numero, mensagem) => {
    const resultado = celular.safeParse(numero);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe(mensagem);
    }
  });
});
