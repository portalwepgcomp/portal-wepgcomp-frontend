"use client";

import Button from "@/components/UI/Button";
import { FormCadastroProfessor } from "@/components/Forms/CadastroProfessor/FormCadastroProfessor";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArrowLeft, GraduationCap } from "lucide-react";

export default function Professores() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <ProtectedLayout>
      <Banner title="Cadastro de Professores" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button size="lg" variante="outline" onClick={() => router.push("/gerenciamento")}>
            <ArrowLeft />
            Voltar para Gerenciamento
          </Button>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-start gap-4 border-b border-line pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Cadastrar Novo Professor
              </h1>
              <p className="mt-1 text-sm text-muted">
                Adicione docentes ao corpo acadêmico do portal para orientação e bancas avaliadoras.
              </p>
            </div>
          </div>

          <FormCadastroProfessor
            formRef={formRef}
            showButtons={true}
            onSuccess={() => router.push("/usuarios")}
          />
        </div>
      </main>
    </ProtectedLayout>
  );
}
