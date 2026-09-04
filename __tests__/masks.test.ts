import { describe, expect, it } from "@jest/globals";
import { maskCPF, maskPhone, unmask } from "@/lib/masks";

describe("Utilitários de Máscara (masks.ts)", () => {
  describe("maskCPF", () => {
    it("deve formatar CPF completo com 11 dígitos", () => {
      expect(maskCPF("12345678901")).toBe("123.456.789-01");
    });

    it("deve formatar CPF parcial progressivamente", () => {
      expect(maskCPF("123")).toBe("123");
      expect(maskCPF("1234")).toBe("123.4");
      expect(maskCPF("1234567")).toBe("123.456.7");
      expect(maskCPF("1234567890")).toBe("123.456.789-0");
    });

    it("deve ignorar caracteres não numéricos e limitar a 11 dígitos", () => {
      expect(maskCPF("123.abc.456-7890199")).toBe("123.456.789-01");
    });

    it("deve retornar string vazia para entrada vazia ou nula", () => {
      expect(maskCPF("")).toBe("");
    });
  });

  describe("maskPhone", () => {
    it("deve formatar celular com 11 dígitos (DDD + 9 dígitos)", () => {
      expect(maskPhone("71988887777")).toBe("(71) 98888-7777");
    });

    it("deve formatar telefone fixo com 10 dígitos (DDD + 8 dígitos)", () => {
      expect(maskPhone("7132836700")).toBe("(71) 3283-6700");
    });

    it("deve formatar entrada parcial progressivamente", () => {
      expect(maskPhone("71")).toBe("(71");
      expect(maskPhone("7198888")).toBe("(71) 9888-8");
    });

    it("deve retornar string vazia para entrada vazia", () => {
      expect(maskPhone("")).toBe("");
    });
  });

  describe("unmask", () => {
    it("deve remover toda a pontuação e retornar apenas dígitos", () => {
      expect(unmask("123.456.789-01")).toBe("12345678901");
      expect(unmask("(71) 98888-7777")).toBe("71988887777");
    });

    it("deve retornar string vazia para entrada vazia", () => {
      expect(unmask("")).toBe("");
    });
  });
});
