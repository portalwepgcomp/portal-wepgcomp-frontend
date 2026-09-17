import { CadastroContent } from "@/components/Auth/CadastroContent";
import { isRegistrationOpen } from "@/lib/registration";

export const dynamic = "force-dynamic";
export default function Cadastro() {
  return <CadastroContent registrationOpen={isRegistrationOpen()} />;
}
