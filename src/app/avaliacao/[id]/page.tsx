"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";

import Rating from "@/components/Rating/Rating";

import LoadingPage from "@/components/LoadingPage";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import Button from "@/components/UI/Button";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { useEvaluation } from "@/hooks/useEvaluation";
import { usePresentation } from "@/hooks/usePresentation";
import { Info } from "lucide-react";

const tooltipTexto =
  "O sistema calcula a nota final de cada apresentação usando média bayesiana, separando avaliações de avaliadores e público geral. A fórmula central é: (N × Média da Amostra + C × Média Prévia) / (N + C), onde N é o número de avaliações recebidas pela apresentação, C é o número de confiança (calculado pelo percentil 40% do número de avaliações por apresentação no evento), Média da Amostra é a média ponderada das avaliações recebidas pela apresentação e Média Prévia é a média geral do evento. Se não houver dados suficientes para o calculo das estatisticas do evento (geral em seu inicio), são utiliados valores padrão: Número de Confiança: 5 para o público e 3 para os avaliadores.";

export default function Avaliacao({ params }: { params: { id: string } }) {
  const [saveEvaluation, setSaveEvaluation] = useState<
    { evaluation: Evaluation | null; criteria: EvaluationCriteria | null }[]
  >([]);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const {
    makeEvaluation,
    evaluations,
    evaluationCriteria,
    getEvaluationByUser,
    getEvaluationCriteria,
    loadingEvaluation,
  } = useEvaluation();
  const { getPresentationAll, presentationList } = usePresentation();
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();

  const sendEvaluation = () => {
    const body: EvaluationParams[] =
      saveEvaluation?.map((criteria) => {
        const { evaluationCriteriaId, submissionId, score, userId, comments } =
          criteria.evaluation as Evaluation;

        return { evaluationCriteriaId, submissionId, score, userId, comments };
      }) ?? [];

    makeEvaluation(body);
  };

  useEffect(() => {
    if (!Edicao?.id || !user?.id) return;
    getPresentationAll(Edicao.id);
    getEvaluationCriteria(Edicao.id);
    getEvaluationByUser(user.id);
  }, [Edicao?.id, user?.id]);

  useEffect(() => {
    if (params?.id) {
      const foundPresentation = presentationList.find(
        (presentationValue) => presentationValue?.id === params?.id
      );

      if (foundPresentation) {
        const evaluationsFilterBySubmission = evaluations?.filter(
          (value) => value.submissionId === foundPresentation?.submission?.id
        );

        const saveEvaluationValues = evaluationCriteria?.map((criteria) => {
          const evaluationValue = evaluationsFilterBySubmission?.find(
            (v) => v.evaluationCriteriaId === criteria.id
          );

          return {
            evaluation: evaluationValue || null,
            criteria: criteria,
          };
        });

        setPresentation(foundPresentation as unknown as Presentation);
        setSaveEvaluation(saveEvaluationValues);
      }
    }
  }, [
    presentationList.length,
    evaluations?.length,
    evaluationCriteria?.length,
  ]);

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-2.5">
        <Banner title="Avaliação" />
        {(loadingEvaluation || !presentation?.submission?.title) && (
          <LoadingPage />
        )}
        {!loadingEvaluation && presentation?.submission?.title && (
          <div className="mb-[300px] flex flex-col items-center gap-[50px]">
            <div className="h-[90px] w-[800px] max-w-[90%] rounded-xl pl-[5px] text-center max-[830px]:h-auto">
              <div className="flex flex-col px-2">
                <div className="text-2xl font-bold">
                  {presentation?.submission?.mainAuthor?.name}
                </div>
                <hr className="my-2 border-line" />
                <div className="text-xl">
                  {presentation?.submission?.title}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-[30px]">
              {saveEvaluation?.map((evaluationData, devIndex) => (
                <div
                  key={evaluationData?.criteria?.id}
                  className="flex flex-col items-center"
                >
                  <div className="text-xl max-[830px]:w-[95%] max-[830px]:text-center">
                    {`${devIndex + 1}. ${
                      evaluationData?.criteria?.description
                    }`}
                  </div>
                  <Rating
                    value={evaluationData?.evaluation?.score ?? 0}
                    onChange={(value) => {
                      setSaveEvaluation((oldValues) =>
                        oldValues?.map((item, index) =>
                          index === devIndex
                            ? {
                                ...item,
                                evaluation: {
                                  userId: user?.id ?? "",
                                  submissionId:
                                    presentation?.submission?.id ?? "",
                                  evaluationCriteriaId: item.criteria?.id ?? "",
                                  score: value,
                                },
                              }
                            : item
                        )
                      );
                    }}
                  />
                </div>
              ))}
              {!saveEvaluation?.length && (
                <div className="mt-4 flex items-center justify-center p-3">
                  <h4 className="mb-0 flex items-center gap-2 text-foreground">
                    <Image
                      src="/assets/images/empty_box.svg"
                      alt="Lista vazia"
                      width={90}
                      height={90}
                    />
                    Essa lista ainda está vazia
                  </h4>
                </div>
              )}
            </div>
            <div className="flex flex-row items-center">
              <Button
                className="h-[43px] w-[246px] rounded-xl border-2 border-brand-orange bg-brand-orange text-xl font-bold hover:bg-[#E68A00]"
                onClick={sendEvaluation}
                disabled={loadingEvaluation || !Edicao?.isActive}
              >
                Avaliar
              </Button>
              <span title={tooltipTexto} className="ml-4 inline-flex cursor-help">
                <Info className="h-5 w-5 text-muted" />
              </span>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
