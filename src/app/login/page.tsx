import { LoginContent } from "@/components/Auth/LoginContent";
import { isRegistrationOpen } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default function Login() {
  return <LoginContent registrationOpen={isRegistrationOpen()} />;
}
