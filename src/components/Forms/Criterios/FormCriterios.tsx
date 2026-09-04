"use client";

import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";

import { useEvaluation } from "@/hooks/useEvaluation";
import { useEffect } from "react";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";

const formCriteriosSchema = z.object({
  criterio1titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título do critério 1 é obrigatório!"),

  criterio2titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título do critério 2 é obrigatório!"),

  criterio3titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título do critério 3 é obrigatório!"),

  criterio4titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título do critério 4 é obrigatório!"),

  criterio5titulo: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Título do critério 5 é obrigatório!"),

  criterio1: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Descrição do critério 1 é obrigatório!"),

  criterio2: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Descrição do critério 2 é obrigatório!"),

  criterio3: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Descrição do critério 3 é obrigatório!"),

  criterio4: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Descrição do critério 4 é obrigatório!"),

  criterio5: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Descrição do critério 5 é obrigatório!"),
});

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

export default function FormCriterios() {
  const { Edicao } = useEdicao();
  const {
    createEvaluationCriteria,
    updateEvaluationCriteria,
    evaluationCriteria,
    getEvaluationCriteria,
  } = useEvaluation();

  type FormCriteriosSchema = z.infer<typeof formCriteriosSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormCriteriosSchema>({
    resolver: zodResolver(formCriteriosSchema),
  });

  const eventEditionId = getEventEditionIdStorage() ?? "";

  const handleFormCriterios = (data: FormCriteriosSchema) => {
    const criteriaOfEdition = evaluationCriteria?.filter(
      (v) => v.eventEditionId === eventEditionId
    );

    if (
      !data.criterio1 ||
      !data.criterio2 ||
      !data.criterio3 ||
      !data.criterio4 ||
      !data.criterio5 ||
      !data.criterio1titulo ||
      !data.criterio2titulo ||
      !data.criterio3titulo ||
      !data.criterio4titulo ||
      !data.criterio5titulo
    ) {
      throw new Error("Um dos campos está vazio");
    }

    const dataIndexavel = data as Record<string, string>;
    const criterios: { id?: string; title: string; description: string }[] =
      criteriaOfEdition?.length
      ? criteriaOfEdition?.map((value, i) => ({
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

    const body: EvaluationCriteriaParams[] = criterios?.map((criteria) => ({
      id: criteria?.id || undefined,
      eventEditionId,
      title: criteria.title,
      description: criteria.description,
      weightRadio: null,
    }));

    if (criteriaOfEdition?.length) {
      updateEvaluationCriteria(body).then((status) => {
        if (status) {
          reset();
          getEvaluationCriteria(eventEditionId);
        }
      });

      return;
    }

    createEvaluationCriteria(body).then((status) => {
      if (status) {
        reset();
        getEvaluationCriteria(eventEditionId);
      }
    });
  };

  useEffect(() => {
    const defaultCriteria = [
      {
        title: "Conteúdo",
        description:
          "Quão satisfeito(a) você ficou com o conteúdo da pesquisa apresentada?",
      },
      {
        title: "Qualidade e clareza",
        description:
          "Quão satisfeito(a) você ficou com a qualidade e clareza da apresentação?",
      },
      {
        title: "Relevância ao tema",
        description:
          "Quão bem a pesquisa abordou e explicou o problema central?",
      },
      {
        title: "Solução proposta",
        description:
          "Quão clara e prática você considera a solução proposta pela pesquisa?",
      },
      {
        title: "Resultados",
        description:
          "Como você avalia a qualidade e aplicabilidade dos resultados apresentados?",
      },
    ];

    defaultCriteria?.map((criteria, i) => {
      setValue(`criterio${i + 1}titulo` as any, criteria.title);
      setValue(`criterio${i + 1}` as any, criteria.description);
    });

    getEvaluationCriteria(eventEditionId);
  }, [eventEditionId]);

  useEffect(() => {
    if (evaluationCriteria.length) {
      evaluationCriteria?.map((criteria, i) => {
        setValue(`criterio${i + 1}titulo` as any, criteria.title ?? "");
        setValue(`criterio${i + 1}` as any, criteria.description ?? "");
      });
    }
  }, [evaluationCriteria]);

  const campos = [
  { titulo: "criterio1titulo" as const, descricao: "criterio1" as const, num: 1 },
  { titulo: "criterio2titulo" as const, descricao: "criterio2" as const, num: 2 },
  { titulo: "criterio3titulo" as const, descricao: "criterio3" as const, num: 3 },
  { titulo: "criterio4titulo" as const, descricao: "criterio4" as const, num: 4 },
  { titulo: "criterio5titulo" as const, descricao: "criterio5" as const, num: 5 },
];

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={handleSubmit(handleFormCriterios)}
    >
      {campos.map(({ titulo, descricao, num }) => (
        <div key={num}>
          <Campo
            label={
              <span className="font-bold">
                {labelObrigatorio(`Digite o tema do critério ${num}:`)}
              </span>
            }
            htmlFor={`criterio${num}-titulo`}
            erro={errors[titulo]?.message}
            className="mb-1"
          >
            <Input
              type="text"
              id={`criterio${num}-titulo`}
              placeholder="Digite o tema do critério"
              className="text-sm"
              {...register(titulo)}
            />
          </Campo>

          <Campo
            label={
              <span className="font-bold">
                {labelObrigatorio(`Digite o critério ${num}:`)}
              </span>
            }
            htmlFor={`criterio${num}-descricao`}
            erro={errors[descricao]?.message}
            className="mb-1"
          >
            <Input
              type="text"
              id={`criterio${num}-descricao`}
              placeholder="Digite o critério"
              className="text-sm"
              {...register(descricao)}
            />
          </Campo>
        </div>
      ))}

      <div className="flex justify-center">
        <Button
          type="submit"
          id="sa-submit-button"
          disabled={!Edicao?.isActive}
          className="bg-brand-orange hover:bg-brand-orange"
        >
          Salvar
        </Button>
      </div>
    </form>
  );
}
