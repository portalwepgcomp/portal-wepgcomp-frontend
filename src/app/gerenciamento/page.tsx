"use client";

import { GraduationCap, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/UI/Button";

const Index = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-card px-8 py-12 text-center shadow-sm">
        <p className="m-0 text-xl font-medium text-foreground">
          Painel Administrativo
        </p>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-12">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-3">
          <div className="flex h-full flex-col rounded-lg bg-card p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Envio de E-mails
            </h3>
            <p className="mb-8 text-sm text-muted">
              Envie mensagens para grupos específicos de usuários do sistema
            </p>
            <Button size="lg" variante="primary" className="mt-auto"
              larguraTotal
              onClick={() => router.push("/gerenciamento/enviar-email")}
            >
              Acessar
            </Button>
          </div>

          <div className="flex h-full flex-col rounded-lg bg-card p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Professores
            </h3>
            <p className="mb-8 text-sm text-muted">Cadastre novos professores</p>
            <Button size="lg" variante="primary" className="mt-auto"
              larguraTotal
              onClick={() => router.push("/gerenciamento/professores")}
            >
              Acessar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
