"use client";

import { FormCadastroProfessor } from "@/components/Forms/CadastroProfessor/FormCadastroProfessor";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";

const headerBtnClass = cn(
  "inline-flex items-center gap-2 rounded-md border-0 bg-transparent px-6 py-4",
  "text-base font-medium text-foreground transition-all duration-200",
  "hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50",
  "[&_svg]:h-4 [&_svg]:w-4",
);

export default function Professores() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <ProtectedLayout>
      <Banner title="Professores" />
      <header className="border-b border-line bg-card shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4" />
          <button className={headerBtnClass} onClick={() => router.back()}>
            <ArrowLeft />
            Voltar
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <div className="rounded-xl border border-line bg-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Cadastrar Novo Professor
            </h2>
            <p className="mt-2 text-muted">
              Preencha os dados abaixo para cadastrar um novo professor. Uma
              senha temporária será gerada e enviada por email.
            </p>
          </div>

          <FormCadastroProfessor formRef={formRef} showButtons={true} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
