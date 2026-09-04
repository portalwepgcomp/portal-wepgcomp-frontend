import type { RotuloContador } from "@/features/shared/types";

interface ContadorItensProps {
  total: number;
  rotulo?: RotuloContador;
}

/**
 * Contador "Há/São N itens" com singular/plural configurável.
 * Extraído de `ListagemContador`.
 */
export default function ContadorItens({
  total,
  rotulo,
}: Readonly<ContadorItensProps>) {
  const texto =
    total === 1
      ? (rotulo?.singular ?? "item cadastrado")
      : (rotulo?.plural ?? "itens cadastrados");

  return (
    <div className="mb-3 text-muted">
      {total === 1 ? "Há" : "São"}{" "}
      <span className="font-bold text-brand-blue-light">{total}</span> {texto}
    </div>
  );
}
