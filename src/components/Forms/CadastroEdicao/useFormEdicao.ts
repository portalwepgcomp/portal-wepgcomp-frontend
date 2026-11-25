"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { UserContext } from "@/hooks/useUsers";
import { useSweetAlert } from "@/hooks/useAlert";
import { committerMembersApi } from "@/services/CommitteeMember";
import { registrarErro } from "@/utils/logError";
import { formEdicaoSchema, type FormEdicaoSchema } from "./formEdicaoSchema";
import { Edicao, EdicaoParams } from "@/models/edicao";

interface UseFormEdicaoOptions {
  edicaoData?: Edicao | null;
}

/** Dados de edição com campos que divergem do tipo global (roomName como array). */
type EdicaoFormulario = Edicao & { roomName?: string[] };

export function useFormEdicao({ edicaoData }: UseFormEdicaoOptions) {
  const { showAlert } = useSweetAlert();
  const { createEdicao, updateEdicao, Edicao } = useEdicao();
  const { user } = useContext(AuthContext);
  const { getAdvisors, advisors, getAdmins, admins } = useContext(UserContext);
  const router = useRouter();

  const [salaInputValue, setSalaInputValue] = useState("");
  const [comissaoInicializadaPara, setComissaoInicializadaPara] =
    useState<string>();
  const edicaoId = edicaoData?.id;
  const comissaoQuery = useQuery({
    queryKey: ["committee-members", edicaoId],
    enabled: !!edicaoId,
    queryFn: () => committerMembersApi.getAllMembers(edicaoId as string),
  });
  const membrosDaEdicao = useMemo(
    () =>
      comissaoQuery.data?.filter(
        (member) => member.eventEditionId === edicaoId,
      ),
    [comissaoQuery.data, edicaoId],
  );
  const comissaoOptions = useMemo(
    () =>
      admins.map((admin) => ({
        value: admin.id ?? "",
        label: admin.name ?? "",
      })),
    [admins],
  );
  const coordenadorOptions = useMemo(() => {
    const coordenadorAtual = membrosDaEdicao?.find(
      (member) =>
        member.role === "OrganizingCommittee" && member.level === "Coordinator",
    );
    if (
      !coordenadorAtual ||
      comissaoOptions.some((option) => option.value === coordenadorAtual.userId)
    ) {
      return comissaoOptions;
    }
    return [
      ...comissaoOptions,
      { value: coordenadorAtual.userId, label: coordenadorAtual.userName },
    ];
  }, [comissaoOptions, membrosDaEdicao]);
  const comissaoDisponivel =
    !edicaoId ||
    (comissaoQuery.isSuccess &&
      !comissaoQuery.isFetching &&
      comissaoInicializadaPara === edicaoId);

  const form = useForm<FormEdicaoSchema>({
    resolver: zodResolver(formEdicaoSchema),
    mode: "onChange",
    defaultValues: { inicio: "", final: "", limite: "", salas: [] },
  });

  const { reset, getValues, handleSubmit, formState, trigger } = form;

  useEffect(() => {
    const dados = edicaoData as EdicaoFormulario | null | undefined;
    reset({
      titulo: dados?.name ?? "",
      descricao: dados?.description ?? "",
      inicio: dados?.startDate ?? "",
      final: dados?.endDate ?? "",
      local: dados?.location ?? "",
      salas:
        dados?.roomName?.map((nome) => ({ label: nome, value: nome })) ?? [],
      comissao: [],
      coordenador: undefined,
      duracao: dados?.presentationDuration ?? 0,
      sessoes: dados?.presentationsPerPresentationBlock ?? 0,
      submissao: dados?.callForPapersText ?? "",
      limite: dados?.submissionDeadline ?? "",
    });
    setComissaoInicializadaPara(undefined);
    void trigger();
  }, [edicaoData, reset, trigger]);

  useEffect(() => {
    if (!edicaoData?.id || !comissaoQuery.isSuccess || !membrosDaEdicao) return;
    const coordenadorAtual = membrosDaEdicao.find(
      (member) =>
        member.role === "OrganizingCommittee" && member.level === "Coordinator",
    );
    reset({
      ...getValues(),
      comissao: membrosDaEdicao
        .filter(
          (member) =>
            member.role === "OrganizingCommittee" &&
            member.level !== "Coordinator",
        )
        .map((member) => ({ value: member.userId, label: member.userName })),
      coordenador: coordenadorAtual
        ? { value: coordenadorAtual.userId, label: coordenadorAtual.userName }
        : undefined,
    });
    setComissaoInicializadaPara(edicaoData.id);
    void trigger();
  }, [
    edicaoData,
    comissaoQuery.isSuccess,
    membrosDaEdicao,
    getValues,
    reset,
    trigger,
  ]);

  useEffect(() => {
    getAdvisors();
    getAdmins();
  }, [getAdvisors, getAdmins]);

  const onSubmit = async (data: FormEdicaoSchema) => {
    if (!comissaoDisponivel) return;
    if (!user) {
      showAlert({
        icon: "error",
        text: "Você precisa estar logado para realizar a submissão.",
        confirmButtonText: "Retornar",
      });
      return;
    }

    const body = {
      name: data.titulo,
      description: data.descricao,
      location: data.local,
      roomName: data.salas.map((s) => s.value),
      coordinatorId: data.coordenador.value,
      organizingCommitteeIds: data.comissao?.map((v) => v.value) || [],
      itSupportIds: [],
      administrativeSupportIds: [],
      communicationIds: [],
      presentationDuration: data.duracao,
      presentationsPerPresentationBlock: data.sessoes,
      callForPapersText: data.submissao,
      startDate: data.inicio,
      submissionDeadline: data.limite,
      endDate: data.final,
    } as EdicaoParams;

    if (edicaoData?.id) {
      await updateEdicao(edicaoData.id, body);
      router.push("/edicoes");
      return;
    }

    const status = await createEdicao(body);
    if (status) router.push("/home");
  };

  const onInvalid = () =>
    registrarErro("Validação do formulário de edição falhou", null);

  return {
    form,
    Edicao,
    comissaoOptions,
    coordenadorOptions,
    comissaoDisponivel,
    carregandoComissao:
      !!edicaoId && (comissaoQuery.isPending || comissaoQuery.isFetching),
    erroComissao: !!edicaoId && comissaoQuery.isError,
    recarregarComissao: comissaoQuery.refetch,
    salaInputValue,
    setSalaInputValue,
    handleSubmit: handleSubmit(onSubmit, onInvalid),
    isValid: formState.isValid && comissaoDisponivel,
    errors: formState.errors,
    advisors,
  };
}
