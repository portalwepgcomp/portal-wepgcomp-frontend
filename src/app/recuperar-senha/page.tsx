"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Campo, Input } from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import { obterClassesBotao } from "@/lib/estilosBotao";
import { useUsers } from "@/hooks/useUsers";
import { useEdicao } from "@/hooks/useEdicao";
import LoadingPage from "@/components/LoadingPage";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const { resetPasswordSendEmail, loadingSendEmail } = useUsers();
  const { Edicao } = useEdicao();

  const validarEmail = (value: string) => {
    if (!value) return "O email é obrigatório.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "E-mail inválido!";
    return "";
  };

  const handleEnviar = async () => {
    const validationError = validarEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    await resetPasswordSendEmail({ email });
    setEnviado(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(validarEmail(value));
  };

  if (loadingSendEmail) {
    return <LoadingPage />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-grow flex-col items-center justify-center px-4 text-black">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        {/* Cabeçalho */}
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-3xl font-bold text-[#0066BA]">
            {Edicao?.name || "WEPGCOMP"}
          </h1>
          <hr className="mx-auto mb-4 max-w-[200px] border-2 border-brand-orange" />
        </div>

        {enviado ? (
          /* Tela de confirmação pós-envio */
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-slate-800">E-mail enviado!</h2>
            <p className="max-w-sm text-slate-600">
              Confira sua caixa de entrada em{" "}
              <strong>{email}</strong>. Siga as instruções para redefinir sua
              senha.
            </p>
            <Link
              href="/login"
              className={`${obterClassesBotao("outline")} mt-2`}
            >
              <ArrowLeft data-icon="inline-start" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          /* Formulário de recuperação */
          <>
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Mail className="h-7 w-7 text-[#0066BA]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Esqueci minha senha
              </h2>
              <p className="max-w-md text-sm text-slate-500">
                Informe o e-mail cadastrado em sua conta e enviaremos um link
                com as instruções para recuperação.
              </p>
            </div>

            <Campo
              label={
                <>
                  E-mail <span className="text-error">*</span>
                </>
              }
              htmlFor="email-recuperar-senha"
              erro={error}
              className="mb-5"
            >
              <Input
                type="email"
                id="email-recuperar-senha"
                placeholder="Insira seu e-mail cadastrado"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
              />
            </Campo>

            <Button size="lg" variante="primary"
              type="button"
              larguraTotal
              disabled={!email || !!error}
              onClick={handleEnviar}
            >
              Enviar link de recuperação
            </Button>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className={obterClassesBotao("outline")}
              >
                <ArrowLeft data-icon="inline-start" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
