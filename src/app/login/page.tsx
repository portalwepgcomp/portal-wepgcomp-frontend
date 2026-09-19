import { LoginContent } from "@/components/Auth/LoginContent";
import { obterStatusInscricoes } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default async function Login() {
  const { registrationOpen } = await obterStatusInscricoes();

  return <LoginContent registrationOpen={registrationOpen} />;
}
