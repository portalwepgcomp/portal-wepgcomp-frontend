"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { UserContext } from "@/hooks/useUsers";
import { useSweetAlert } from "@/hooks/useAlert";
import { useCommittee } from "@/hooks/useCommittee";
import { registrarErro } from "@/utils/logError";
import {
  formEdicaoSchema,
  type FormEdicaoSchema,
} from "./formEdicaoSchema";
import { Edicao, EdicaoParams } from "@/models/edicao";
import { OptionType } from "@/models/forms";

interface UseFormEdicaoOptions {
  edicaoData?: Edicao | null;
}

/** Dados de edição com campos que divergem do tipo global (roomName como array). */
type EdicaoFormulario = Edicao & { roomName?: string[] };

export function useFormEdicao({ edicaoData }: UseFormEdicaoOptions) {
  const { showAlert } = useSweetAlert();
  const { createEdicao, updateEdicao, Edicao } = useEdicao();
  const { getCommitterAll, committerList } = useCommittee();
  const { user } = useContext(AuthContext);
  const { getAdvisors, advisors, getAdmins, admins } = useContext(UserContext);
  const router = useRouter();

  const [salaInputValue, setSalaInputValue] = useState("");
  const [comissaoOptions, setComissaoOptions] = useState<OptionType[]>([]);

  const form = useForm<FormEdicaoSchema>({
    resolver: zodResolver(formEdicaoSchema),
    mode: "onChange",
    defaultValues: { inicio: "", final: "", limite: "" },
  });

  const { setValue, handleSubmit, formState } = form;

  useEffect(() => {
    const dados = edicaoData as EdicaoFormulario | null | undefined;
    if (!dados || !Object.keys(dados).length) return;

    setValue("titulo", dados.name ?? "");
    setValue("descricao", dados.description ?? "");
    setValue("inicio", dados.startDate ?? "");
    setValue("final", dados.endDate ?? "");
    setValue("local", dados.location ?? "");
    setValue(
      "salas",
      dados.roomName?.map((nome) => ({ label: nome, value: nome })) ?? [],
    );
    setValue(
      "comissao",
      committerList
        ?.filter((c) => c.role === "OrganizingCommittee")
        .map((c) => ({ value: c.userId, label: c.userName })),
    );
    setValue("duracao", dados.presentationDuration ?? 0);
    setValue("sessoes", dados.presentationsPerPresentationBlock ?? 0);
    setValue("submissao", dados.callForPapersText ?? "");
    setValue("limite", dados.submissionDeadline ?? "");
  }, [edicaoData, committerList, setValue]);

  useEffect(() => {
    getAdvisors();
    getAdmins();
  }, [getAdvisors, getAdmins]);

  useEffect(() => {
    if (admins.length > 0) {
      setComissaoOptions(
        admins.map((v) => ({ value: v.id ?? "", label: v.name ?? "" })),
      );
    }
  }, [admins]);

  useEffect(() => {
    if (edicaoData?.id) getCommitterAll(edicaoData.id);
  }, [edicaoData?.id, getCommitterAll]);

  const onSubmit = async (data: FormEdicaoSchema) => {
    if (!user) {
      showAlert({
        icon: "error",
        text: "Você precisa estar logado para realizar a submissão.",
        confirmButtonText: "Retornar",
      });
      return;
    }

    const body = {
      ...edicaoData,
      name: data.titulo,
      description: data.descricao,
      location: data.local,
      roomName: data.salas.map((s) => s.value) as unknown as string,
      coordinatorId: user.id,
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
    salaInputValue,
    setSalaInputValue,
    handleSubmit: handleSubmit(onSubmit, onInvalid),
    isValid: formState.isValid,
    errors: formState.errors,
    advisors,
  };
}
