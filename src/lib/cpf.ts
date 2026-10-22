export const cpfValido = (cpf: string): boolean => {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base: string, pesoInicial: number) => {
    const soma = base
      .split("")
      .reduce(
        (total, digito, indice) =>
          total + Number(digito) * (pesoInicial - indice),
        0,
      );
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    calcularDigito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10])
  );
};
