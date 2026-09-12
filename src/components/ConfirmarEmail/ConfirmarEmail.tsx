"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import Spinner from "@/components/UI/Spinner";
import { useEdicao } from "@/hooks/useEdicao";
import { userApi } from "@/services/user";
import { getErrorMessage } from "@/utils/error";
import { registrarErro } from "@/utils/logError";

type StatusConfirmacao = "carregando" | "sucesso" | "erro";

interface ConfirmarEmailProps {
  token?: string;
}

export function ConfirmarEmail({ token }: Readonly<ConfirmarEmailProps>) {
  const { Edicao } = useEdicao();

  const [status, setStatus] = useState<StatusConfirmacao>("carregando");
  const [mensagemErro, setMensagemErro] = useState("");

  const confirmacaoDisparada = useRef(false);

  useEffect(() => {
    if (confirmacaoDisparada.current) return;
    confirmacaoDisparada.current = true;

    if (!token) {
      setMensagemErro(
        "O link de confirmação está incompleto. Abra-o exatamente como recebeu no e-mail, sem cortar nenhum trecho.",
      );
      setStatus("erro");
      return;
    }

    userApi
      .confirmEmail(token)
      .then(() => setStatus("sucesso"))
      .catch((err: unknown) => {
        registrarErro("confirmarEmail", err);
        setMensagemErro(
          getErrorMessage(
            err,
            "Não foi possível confirmar seu e-mail. Tente novamente mais tarde.",
          ),
        );
        setStatus("erro");
      });
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-grow flex-col items-center justify-center px-4 text-black">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-3xl font-bold text-[#0066BA]">
            {Edicao?.name || "WEPGCOMP"}
          </h1>
          <hr className="mx-auto mb-4 max-w-[200px] border-2 border-brand-orange" />
        </div>

        {status === "carregando" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner colorClassName="text-success" className="h-12 w-12" />
            <h2 className="text-xl font-bold text-slate-800">
              Confirmando seu e-mail...
            </h2>
            <p className="max-w-sm text-slate-600">
              Aguarde um instante enquanto validamos o link recebido.
            </p>
          </div>
        )}

        {status === "sucesso" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-slate-800">
              E-mail confirmado!
            </h2>
            <p className="max-w-sm text-slate-600">
              Sua conta foi verificada com sucesso. Agora você já pode acessar o
              portal.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-2 font-semibold text-white no-underline transition hover:opacity-90"
            >
              Ir para o login
            </Link>
          </div>
        )}

        {status === "erro" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-16 w-16 text-error" />
            <h2 className="text-xl font-bold text-slate-800">
              Não foi possível confirmar
            </h2>
            <p className="max-w-sm text-slate-600">{mensagemErro}</p>
            <p className="max-w-sm text-sm text-slate-500">
              Se o link expirou, cadastre-se novamente para receber um novo
              e-mail de confirmação.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-orange px-6 py-2 font-semibold text-brand-orange no-underline transition hover:bg-orange-50"
              >
                Ir para o login
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-600 no-underline transition hover:bg-slate-50"
              >
                Fazer cadastro
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
