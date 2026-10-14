"use client";

import { useContext, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Info } from "lucide-react";
import Rating from "@/components/Rating/Rating";
import LoadingPage from "@/components/LoadingPage";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEvaluation } from "@/hooks/useEvaluation";
import { evaluationApi } from "@/services/evaluation";
import {
  Evaluation,
  EvaluationContextData,
  EvaluationParams,
} from "@/models/evaluation";
import { getErrorMessage } from "@/utils/error";

const visitorSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(255),
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
});

type CriterionScore = {
  id: string;
  description: string;
  score: number | null;
  comments?: string;
};

export default function Avaliacao({ params }: { params: { id: string } }) {
  const { user, isValidatingToken, isLoggingOut } = useContext(AuthContext);
  const { makeEvaluation, makeAnonymousEvaluation, loadingEvaluation } =
    useEvaluation();
  const [context, setContext] = useState<EvaluationContextData | null>(null);
  const [scores, setScores] = useState<CriterionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isValidatingToken || isLoggingOut) return;
    let cancelled = false;
    setLoading(true);
    setContext(null);
    setScores([]);
    setError("");
    setFormError("");

    async function load() {
      try {
        const data = await evaluationApi.getEvaluationContext(params.id);
        let criteria = data.criteria;
        let previous: Evaluation[] = [];
        if (user?.id) {
          [criteria, previous] = await Promise.all([
            evaluationApi.getEvaluationCriteria(data.eventEdition.id),
            evaluationApi.getEvaluationByUser(user.id),
          ]);
        }
        if (cancelled) return;
        setContext(data);
        setScores(
          criteria.map((criterion) => {
            const evaluation = previous.find(
              (value) =>
                value.submissionId === data.submissionId &&
                value.evaluationCriteriaId === criterion.id,
            );
            return {
              id: criterion.id,
              description: criterion.description,
              score: evaluation?.score ?? null,
              comments: evaluation?.comments,
            };
          }),
        );
      } catch (err: unknown) {
        if (!cancelled)
          setError(getErrorMessage(err, "Erro ao carregar a avaliação."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, user?.id, isValidatingToken, isLoggingOut]);

  async function sendEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!context || !context.eventEdition.isActive || loadingEvaluation) return;
    if (
      !scores.length ||
      scores.some((criterion) => criterion.score === null)
    ) {
      setFormError("Preencha todos os critérios antes de avaliar.");
      return;
    }
    const body: EvaluationParams[] = scores.map((criterion) => ({
      evaluationCriteriaId: criterion.id,
      submissionId: context.submissionId,
      score: criterion.score!,
      comments: criterion.comments,
    }));

    if (user?.id) {
      await makeEvaluation(
        body.map((evaluation) => ({ ...evaluation, userId: user.id })),
      );
    } else if (
      context.eventEdition.isEvaluationRestrictToLoggedUsers === false
    ) {
      const visitor = visitorSchema.safeParse({ name, email });
      if (!visitor.success) {
        setFormError(visitor.error.issues[0].message);
        return;
      }
      await makeAnonymousEvaluation({
        name: visitor.data.name,
        email: visitor.data.email.toLowerCase(),
        evaluations: body,
      });
    }
  }

  if (loading || isValidatingToken || isLoggingOut) return <LoadingPage />;
  if (error || !context)
    return <p role="alert">{error || "Apresentação não encontrada."}</p>;
  if (
    !user &&
    context.eventEdition.isEvaluationRestrictToLoggedUsers !== false
  ) {
    return <ProtectedLayout>{null}</ProtectedLayout>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Banner title="Avaliação" />
      <form
        onSubmit={sendEvaluation}
        className="mb-[300px] flex flex-col items-center gap-[50px]"
      >
        <div className="w-[800px] max-w-[90%] rounded-xl text-center">
          <div className="text-2xl font-bold">{context.authorName}</div>
          <hr className="my-2 border-line" />
          <div className="text-xl">{context.title}</div>
          <p className="mt-2 text-sm text-muted">{context.eventEdition.name}</p>
        </div>

        {!user && (
          <fieldset
            className="w-full max-w-md px-4"
            disabled={loadingEvaluation}
          >
            <legend className="mb-4 font-semibold">Avaliação sem login</legend>
            <Campo htmlFor="visitor-name" label="Nome">
              <Input
                id="visitor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={255}
                autoComplete="name"
              />
            </Campo>
            <Campo htmlFor="visitor-email" label="E-mail">
              <Input
                id="visitor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                autoComplete="email"
              />
            </Campo>
            <p className="text-sm text-muted">
              O e-mail identifica sua avaliação. Um novo envio para o mesmo
              trabalho atualiza suas notas.
            </p>
          </fieldset>
        )}

        <fieldset
          disabled={loadingEvaluation}
          className="flex flex-col items-center gap-[30px]"
        >
          {scores.map((criterion, index) => (
            <div
              key={criterion.id}
              className="flex flex-col items-center"
              role="group"
              aria-label={criterion.description}
            >
              <div className="text-xl max-[830px]:w-[95%] max-[830px]:text-center">
                {index + 1}. {criterion.description}
              </div>
              <Rating
                value={criterion.score ?? 0}
                onChange={(value) => {
                  if (loadingEvaluation) return;
                  setScores((values) =>
                    values.map((item) =>
                      item.id === criterion.id
                        ? { ...item, score: value }
                        : item,
                    ),
                  );
                }}
              />
            </div>
          ))}
          {!scores.length && (
            <p>Nenhum critério de avaliação foi cadastrado para esta edição.</p>
          )}
        </fieldset>
        {formError && (
          <p role="alert" className="text-error">
            {formError}
          </p>
        )}
        {!context.eventEdition.isActive && (
          <p>Esta edição não está aberta para avaliações.</p>
        )}
        <Button
          size="lg"
          variante="primary"
          type="submit"
          disabled={
            loadingEvaluation ||
            !context.eventEdition.isActive ||
            !scores.length
          }
        >
          {loadingEvaluation ? "Enviando..." : "Avaliar"}
        </Button>
        <span
          title="As notas de banca e público são calculadas separadamente por média bayesiana: (N × média da amostra + C × média prévia) / (N + C). O cálculo considera os pesos dos critérios e a quantidade de avaliações."
          className="inline-flex cursor-help"
        >
          <Info className="h-5 w-5 text-muted" />
        </span>
      </form>
    </div>
  );
}
