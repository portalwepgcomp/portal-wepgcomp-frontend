/**
 * Utilitários de aplicação e remoção de máscaras em campos de texto.
 *
 * Estas funções formatam valores de forma puramente funcional, garantindo
 * compatibilidade direta com inputs controlados ou formulários do react-hook-form.
 */

/**
 * Aplica máscara de CPF (000.000.000-00) aos dígitos informados.
 *
 * @param value String contendo o CPF digitado pelo usuário.
 * @returns CPF formatado com pontos e traço.
 */
export const maskCPF = (value: string): string => {
  if (!value) return "";
  // 1. Remove qualquer caractere que não seja número
  let digits = value.replace(/\D/g, "").slice(0, 11);

  // 2. Aplica a pontuação gradualmente conforme o usuário digita
  digits = digits.replace(/(\d{3})(\d)/, "$1.$2");
  digits = digits.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  digits = digits.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  return digits;
};

/**
 * Aplica máscara de telefone/WhatsApp brasileiro: (99) 99999-9999 ou (99) 9999-9999.
 *
 * @param value String contendo o número digitado.
 * @returns Telefone formatado com DDD entre parênteses e hífen.
 */
export const maskPhone = (value: string): string => {
  if (!value) return "";
  // Remove caracteres não numéricos e limita a 11 dígitos (DDD + 9 dígitos)
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Formato com 8 dígitos: (99) 9999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Formato celular com 9 dígitos: (99) 99999-9999
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Remove todos os caracteres não numéricos de uma string (pontos, traços, parênteses).
 * Ideal para sanitizar os dados antes de enviá-los à API.
 *
 * @param value String com máscara.
 * @returns String contendo apenas os números.
 */
export const unmask = (value: string): string => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

