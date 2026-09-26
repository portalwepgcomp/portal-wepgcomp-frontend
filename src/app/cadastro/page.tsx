import { CadastroContent } from "@/components/Auth/CadastroContent";
import { obterStatusInscricoes } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default async function Cadastro() {
  const { registrationOpen } = await obterStatusInscricoes();

  return <CadastroContent registrationOpen={registrationOpen} />;
}
