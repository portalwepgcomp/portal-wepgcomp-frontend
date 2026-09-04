import Premiacao from "@/templates/Premiacao/Premiacao";
import { PremiacaoCategoriaProps } from "@/models/premiacao";

export default function PremiacaoCategoria({
  categoria,
  premiacoes,
  avaliadores,
  searchValue
}: PremiacaoCategoriaProps) {
  return (
    <Premiacao categoria={categoria} premiacoes={premiacoes} avaliadores={avaliadores} searchValue={searchValue} />
  );
}
