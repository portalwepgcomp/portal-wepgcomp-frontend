"use client";

import Button from "@/components/UI/Button";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { ArrowLeft, FileText } from "lucide-react";

import { useSweetAlert } from "@/hooks/useAlert";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { FormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/FormCadastroApresentacao";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { useEdicao } from "@/hooks/useEdicao";
import { useSubmission } from "@/hooks/useSubmission";

export default function CadastroApresentacao() {
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();
  const { submission } = useSubmission();
  const { showAlert } = useSweetAlert();
  const router = useRouter();

  // Verifica permissão com segurança (permitido para Presenter, Professor e Administradores)
  useEffect(() => {
    if (!user) return;

    const isPresenter = user.profile === "Presenter";
    const isProfessor = user.profile === "Professor";
    const isAdmin =
      user.level === "Admin" ||
      user.level === "Superadmin" ||
      (user as unknown as { role?: string }).role === "Admin" ||
      (user as unknown as { role?: string }).role === "Superadmin";

    if (!isPresenter && !isProfessor && !isAdmin) {
      showAlert({
        icon: "error",
        title: "Acesso não autorizado",
        text: "Você não possui permissão para cadastrar ou editar apresentações.",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/");
      });
    }
  }, [router, showAlert, user]);

  const destinoVoltar =
    user?.level === "Default" && user?.profile === "Presenter"
      ? "/minha-apresentacao"
      : "/apresentacoes";

  return (
    <ProtectedLayout>
      <Banner
        title={
          submission && submission.id
            ? "Editar Apresentação"
            : "Submissão de Apresentação"
        }
      />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button size="lg" variante="outline" onClick={() => router.push(destinoVoltar)}>
            <ArrowLeft />
            Voltar para {user?.level === "Default" ? "Minha Apresentação" : "Apresentações"}
          </Button>
        </div>

        {!user ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-line bg-card p-12 shadow-sm">
            <IndicadorDeCarregamento />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-start gap-4 border-b border-line pb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {submission && submission.id
                    ? "Editar Trabalho Submetido"
                    : "Formulário de Submissão"}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Edição: <strong>{Edicao?.name || "WEPGCOMP"}</strong> — Preencha as informações do trabalho e anexe o slide.
                </p>
              </div>
            </div>

            <FormCadastroApresentacao />
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
}
