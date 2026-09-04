"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UUID } from "crypto";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useSweetAlert } from "@/hooks/useAlert";
import { useEdicao } from "@/hooks/useEdicao";
import { SubmissionContext, useSubmission } from "@/hooks/useSubmission";
import { useSubmissionFile } from "@/hooks/useSubmissionFile";
import { UserContext } from "@/hooks/useUsers";
import { formatLink } from "@/utils/formatLink";
import { registrarErro } from "@/utils/logError";
import {
  esquemaCadastro,
  type CadastroFormulario,
} from "./formCadastroApresentacaoSchema";
import { montarNomeArquivoPdf } from "./montarNomeArquivoPdf";

/**
 * Toda a lógica do formulário de cadastro/edição de apresentação: estado,
 * carregamento de dados, upload de PDF e submissão (create/update). A UI vive
 * em `FormCadastroApresentacao.tsx` (só JSX). Mesmo padrão do `useFormEdicao`.
 */
export function useFormCadastroApresentacao() {
  const roteador = useRouter();
  const { showAlert } = useSweetAlert();
  const { user } = useContext(AuthContext);
  const { createSubmission, updateSubmissionById, submission, setSubmission } =
    useContext(SubmissionContext);
  const { getAdvisors, advisors, getUsers, userList, loadingUserList } =
    useContext(UserContext);
  const { sendFile, deleteFile } = useSubmissionFile();
  const { Edicao } = useEdicao();
  const { submissionList } = useSubmission();

  const [professoresCarregou, setProfessoresCarregou] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [carregandoEnvio, setCarregandoEnvio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<CadastroFormulario>({
    resolver: zodResolver(esquemaCadastro),
  });

  useEffect(() => {
    if (submission && Object.keys(submission).length) {
      setValue("id", submission.id);
      setValue("titulo", submission?.title);
      setValue("resumo", submission?.abstract ?? "");
      setValue("apresentador", submission?.mainAuthorId);
      setValue("orientador", submission?.advisorId);
      setValue("coorientador", submission?.coAdvisor);
      setValue("slide", submission?.pdfFile);
      setNomeArquivo(submission?.pdfFile);
      setValue("celular", submission?.phoneNumber);
      setValue("linkApresentacao", submission?.linkHostedFile || "");
    } else {
      setValue("id", "");
      setValue("titulo", "");
      setValue("resumo", "");
      setValue("apresentador", "");
      setValue("orientador", "");
      setValue("coorientador", "");
      setValue("data", "");
      setValue("slide", "");
      setValue("celular", "");
      setValue("linkApresentacao", "");

      setArquivo(null);
      setNomeArquivo(null);
    }
  }, [submission, setValue]);

  const opcoesApresentadoresSelect = useMemo(() => {
    return userList
      .filter((u) => u.profile === "Presenter")
      .map((u) => ({
        ...u,
        displayLabel: `${u.name} | ${
          submissionList.some((sub) => sub.mainAuthorId === u.id)
            ? "Possui apresentação"
            : "Não possui apresentação"
        }`,
      }));
  }, [userList, submissionList]);

  useEffect(() => {
    if (!professoresCarregou) {
      getAdvisors();
      setProfessoresCarregou(true);
    }
  }, [professoresCarregou, getAdvisors]);

  useEffect(() => {
    if (user?.level !== "Default" && userList.length === 0) {
      getUsers({ profiles: "Presenter" });
    }
  }, [user?.level, userList.length, getUsers]);

  const aoMudarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivoSelecionado = e.target.files?.[0];

    if (arquivoSelecionado) {
      setArquivo(arquivoSelecionado);
      setNomeArquivo(arquivoSelecionado.name);
      setValue("slide", arquivoSelecionado.name, {
        shouldValidate: true,
      });
    }
  };

  const criarDadosSubmissao = (data: CadastroFormulario, arquivoPdf: string) => {
    return {
      ...submission,
      eventEditionId: getEventEditionIdStorage() ?? "",
      mainAuthorId: data.apresentador || user?.id,
      title: data.titulo,
      abstractText: data.resumo,
      advisorId: data.orientador as UUID,
      coAdvisor: data.coorientador || "",
      dateSuggestion: data.data ? new Date(data.data) : undefined,
      pdfFile: arquivoPdf,
      phoneNumber: data.celular,
      linkHostedFile: formatLink(data.linkApresentacao || ""),
    };
  };

  const processarSubmissao = async (dadosSubmissao: any): Promise<boolean> => {
    setCarregandoEnvio(true);
    try {
      if (submission?.id) {
        return await updateSubmissionById(submission.id, dadosSubmissao);
      } else {
        const sucesso = await createSubmission(dadosSubmissao);
        if (sucesso && user?.profile === "Presenter") {
          roteador.push("/minha-apresentacao");
        }
        return sucesso;
      }
    } catch (erro) {
      registrarErro("Erro ao processar submissão", erro);
      return false;
    } finally {
      setCarregandoEnvio(false);
    }
  };

  const limparArquivoOrfao = async (arquivoKey: string) => {
    try {
      await deleteFile(arquivoKey);
    } catch (erro) {
      registrarErro("Erro ao remover arquivo órfão", erro);
    }
  };

  const aoEnviar = async (data: CadastroFormulario) => {
    if (!user) {
      showAlert({
        icon: "error",
        text: "Você precisa estar logado para realizar a submissão.",
        confirmButtonText: "Retornar",
      });
      return;
    }

    let arquivoEnviadoKey: string | null = null;

    try {
      const nomeApresentador =
        (data.apresentador &&
          (userList.find((u) => u.id === data.apresentador)?.name || "")) ||
        user.name;

      if (arquivo) {
        const nomeMontado = montarNomeArquivoPdf(
          nomeApresentador,
          new Date(),
          data.titulo,
        );
        const respostaUpload = await sendFile(arquivo, user.id, nomeMontado);
        if (!respostaUpload?.key) {
          throw new Error("Falha no upload do arquivo");
        }
        arquivoEnviadoKey = respostaUpload.key;
      }

      const dadosSubmissao = criarDadosSubmissao(
        data,
        arquivoEnviadoKey || data.slide || "",
      );

      const sucesso = await processarSubmissao(dadosSubmissao);

      if (sucesso) {
        reset();
        setSubmission(null);
        setArquivo(null);
        setNomeArquivo("");

        showAlert({
          icon: "success",
          text: "Submissão realizada com sucesso!",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error("Falha ao processar submissão");
      }
    } catch (e) {
      if (arquivoEnviadoKey) {
        await limparArquivoOrfao(arquivoEnviadoKey);
      }
    }
  };

  const aoErro = () =>
    registrarErro("Validação do formulário de apresentação falhou", null);

  const aoMudarTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const tituloModal =
    submission && submission.id
      ? "Editar Apresentação"
      : "Cadastrar Apresentação";

  return {
    register,
    control,
    errors,
    onSubmit: handleSubmit(aoEnviar, aoErro),
    user,
    loadingUserList,
    opcoesApresentadoresSelect,
    advisors,
    nomeArquivo,
    submission,
    carregandoEnvio,
    edicaoAtiva: !!Edicao?.isActive,
    aoMudarArquivo,
    aoMudarTextarea,
    tituloModal,
  };
}
