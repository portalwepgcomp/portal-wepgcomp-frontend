"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";

import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import { useEvaluation } from "@/hooks/useEvaluation";
import { EvaluationCriteriaParams } from "@/models/evaluation";
import { Campo, Input } from "@/components/UI/Input";
import { useSweetAlert } from "@/hooks/useAlert";

const formCriteriosSchema = z.object({
  criterio1titulo: z.string().min(1, "Tema do critério 1 é obrigatório!"),
  criterio2titulo: z.string().min(1, "Tema do critério 2 é obrigatório!"),
  criterio3titulo: z.string().min(1, "Tema do critério 3 é obrigatório!"),
  criterio4titulo: z.string().min(1, "Tema do critério 4 é obrigatório!"),
  criterio5titulo: z.string().min(1, "Tema do critério 5 é obrigatório!"),

  criterio1: z.string().min(1, "Enunciado do critério 1 é obrigatório!"),
  criterio2: z.string().min(1, "Enunciado do critério 2 é obrigatório!"),
  criterio3: z.string().min(1, "Enunciado do critério 3 é obrigatório!"),
  criterio4: z.string().min(1, "Enunciado do critério 4 é obrigatório!"),
  criterio5: z.string().min(1, "Enunciado do critério 5 é obrigatório!"),
});

type FormCriteriosSchema = z.infer<typeof formCriteriosSchema>;

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error font-bold">*</span>
  </>
);

const campos = [
  { titulo: "criterio1titulo" as const, descricao: "criterio1" as const, num: 1, defaultName: "Conteúdo" },
  { titulo: "criterio2titulo" as const, descricao: "criterio2" as const, num: 2, defaultName: "Qualidade e Clareza" },
  { titulo: "criterio3titulo" as const, descricao: "criterio3" as const, num: 3, defaultName: "Relevância ao Tema" },
  { titulo: "criterio4titulo" as const, descricao: "criterio4" as const, num: 4, defaultName: "Solução Proposta" },
  { titulo: "criterio5titulo" as const, descricao: "criterio5" as const, num: 5, defaultName: "Resultados" },
];

export default function FormCriterios() {
  const { Edicao } = useEdicao();
  const { showAlert } = useSweetAlert();
  const {
    createEvaluationCriteria,
    updateEvaluationCriteria,
    evaluationCriteria,
    getEvaluationCriteria,
  } = useEvaluation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormCriteriosSchema>({
    resolver: zodResolver(formCriteriosSchema),
  });

  const eventEditionId = getEventEditionIdStorage() ?? "";

  const handleFormCriterios = async (data: FormCriteriosSchema) => {
    const criteriaOfEdition = evaluationCriteria?.filter(
      (v) => v.eventEditionId === eventEditionId
    );

    const dataIndexavel = data as Record<string, string>;
    const criterios: { id?: string; title: string; description: string }[] =
      criteriaOfEdition?.length
        ? criteriaOfEdition.map((value, i) => ({
            id: value.id,
            title: dataIndexavel[`criterio${i + 1}titulo`],
            description: dataIndexavel[`criterio${i + 1}`],
          }))
        : [
            { title: data.criterio1titulo, description: data.criterio1 },
            { title: data.criterio2titulo, description: data.criterio2 },
            { title: data.criterio3titulo, description: data.criterio3 },
            { title: data.criterio4titulo, description: data.criterio4 },
            { title: data.criterio5titulo, description: data.criterio5 },
          ];

    const body: EvaluationCriteriaParams[] = criterios.map((criteria) => ({
      id: criteria?.id || undefined,
      eventEditionId,
      title: criteria.title,
      description: criteria.description,
      weightRadio: null,
    }));

    try {
      let status = false;
      if (criteriaOfEdition?.length) {
        status = await updateEvaluationCriteria(body);
      } else {
        status = await createEvaluationCriteria(body);
      }

      if (status) {
        getEvaluationCriteria(eventEditionId);
        showAlert({
          icon: "success",
          title: "Critérios Salvos!",
          text: "Os critérios de avaliação foram atualizados com sucesso.",
        });
      }
    } catch {
      showAlert({
        icon: "error",
        title: "Erro ao Salvar",
        text: "Ocorreu um erro ao salvar os critérios de avaliação.",
      });
    }
  };

  useEffect(() => {
    const defaultCriteria = [
      {
        title: "Conteúdo",
        description: "Quão satisfeito(a) você ficou com o conteúdo da pesquisa apresentada?",
      },
      {
        title: "Qualidade e clareza",
        description: "Quão satisfeito(a) você ficou com a qualidade e clareza da apresentação?",
      },
      {
        title: "Relevância ao tema",
        description: "Quão bem a pesquisa abordou e explicou o problema central?",
      },
      {
        title: "Solução proposta",
        description: "Quão clara e prática você considera a solução proposta pela pesquisa?",
      },
      {
        title: "Resultados",
        description: "Como você avalia a qualidade e aplicabilidade dos resultados apresentados?",
      },
    ];

    defaultCriteria.forEach((criteria, i) => {
      const titleKey = `criterio${i + 1}titulo` as keyof FormCriteriosSchema;
      const descKey = `criterio${i + 1}` as keyof FormCriteriosSchema;
      setValue(titleKey, criteria.title);
      setValue(descKey, criteria.description);
    });

    if (eventEditionId) {
      getEvaluationCriteria(eventEditionId);
    }
  }, [eventEditionId, setValue, getEvaluationCriteria]);

  useEffect(() => {
    if (evaluationCriteria?.length) {
      evaluationCriteria.forEach((criteria, i) => {
        const titleKey = `criterio${i + 1}titulo` as keyof FormCriteriosSchema;
        const descKey = `criterio${i + 1}` as keyof FormCriteriosSchema;
        if (criteria.title) setValue(titleKey, criteria.title);
        if (criteria.description) setValue(descKey, criteria.description);
      });
    }
  }, [evaluationCriteria, setValue]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormCriterios)}>
      <div className="grid grid-cols-1 gap-6">
        {campos.map(({ titulo, descricao, num, defaultName }) => (
          <div
            key={num}
            className="group rounded-xl border border-line bg-muted-light/20 p-5 transition-all duration-200 hover:border-brand-blue/40 hover:bg-card hover:shadow-xs"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue text-xs font-bold text-white shadow-xs">
                {num}
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Critério {num}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Campo
                  label={<span className="text-xs font-semibold text-foreground">{labelObrigatorio("Tema do Critério")}</span>}
                  htmlFor={`criterio${num}-titulo`}
                  erro={errors[titulo]?.message}
                >
                  <Input
                    type="text"
                    id={`criterio${num}-titulo`}
                    placeholder={`Ex.: ${defaultName}`}
                    className="text-sm rounded-lg"
                    {...register(titulo)}
                  />
                </Campo>
              </div>

              <div className="sm:col-span-2">
                <Campo
                  label={<span className="text-xs font-semibold text-foreground">{labelObrigatorio("Enunciado da Pergunta / Avaliação")}</span>}
                  htmlFor={`criterio${num}-descricao`}
                  erro={errors[descricao]?.message}
                >
                  <Input
                    type="text"
                    id={`criterio${num}-descricao`}
                    placeholder="Enunciado orientativo para a nota de 1 a 5 estrelas"
                    className="text-sm rounded-lg"
                    {...register(descricao)}
                  />
                </Campo>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-6">
        <button
          type="submit"
          id="sa-submit-button"
          disabled={!Edicao?.isActive || isSubmitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-orange px-8 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>Salvar Todos os Critérios</span>
        </button>
      </div>
    </form>
  );
}
