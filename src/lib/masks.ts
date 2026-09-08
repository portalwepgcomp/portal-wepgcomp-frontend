export const maskCPF = (value: string): string => {
  if (!value) return "";
  let digits = value.replace(/\D/g, "").slice(0, 11);

  digits = digits.replace(/(\d{3})(\d)/, "$1.$2");
  digits = digits.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  digits = digits.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  return digits;
};

export const maskPhone = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const unmask = (value: string): string => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};
