"use client";

import Button from "@/components/UI/Button";
import { ArrowLeft, Settings2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FormEdicao } from "@/components/Forms/CadastroEdicao/FormEdicao";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { edicaoApi } from "@/services/edicao";

export default function EditarEdicao() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: edicao, isLoading } = useQuery({
    queryKey: ["edicao", id],
    queryFn: () => edicaoApi.getEdicaoById(id),
    enabled: !!id,
  });

  return (
    <ProtectedLayout>
      <Banner title="Editar Edição" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button size="lg" variante="outline" onClick={() => router.push("/edicoes")}>
            <ArrowLeft />
            Voltar para Edições
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-line bg-card p-12 shadow-sm">
            <IndicadorDeCarregamento />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-start gap-4 border-b border-line pb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Settings2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Editar Edição do Evento
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Configure informações gerais, prazos de submissão, comitê e local do evento.
                </p>
              </div>
            </div>

            <FormEdicao edicaoData={edicao ?? null} />
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
}
