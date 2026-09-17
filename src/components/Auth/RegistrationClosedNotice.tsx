import { obterClassesBotao } from "@/lib/estilosBotao";
import { CalendarX2 } from "lucide-react";
import Link from "next/link";

type RegistrationClosedNoticeProps = {
  compact?: boolean;
};

export function RegistrationClosedNotice({
  compact = false,
}: RegistrationClosedNoticeProps) {
  return (
    <section
      aria-labelledby="registration-closed-title"
      className="w-full rounded-xl border border-amber-300 bg-amber-50 p-5 text-slate-900"
      role="status"
    >
      <div className="flex items-start gap-3">
        <CalendarX2
          aria-hidden="true"
          className="mt-0.5 size-6 shrink-0 text-amber-700"
        />
        <div>
          <h2 className="text-xl font-semibold" id="registration-closed-title">
            Inscrições encerradas
          </h2>
          <p className="mt-2 text-base leading-relaxed">
            O período de inscrições desta edição foi encerrado. Quem já possui
            cadastro pode entrar normalmente e acompanhar a programação do
            evento.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {!compact && (
          <Link className={obterClassesBotao("primary")} href="/login">
            Ir para o login
          </Link>
        )}
        <Link className={obterClassesBotao("outline")} href="/home#Programacao">
          Ver programação
        </Link>
      </div>
    </section>
  );
}
