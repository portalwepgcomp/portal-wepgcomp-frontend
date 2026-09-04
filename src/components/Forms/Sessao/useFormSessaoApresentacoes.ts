"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useSubmission } from "@/hooks/useSubmission";
import { useUsers } from "@/hooks/useUsers";
import { formatOptions } from "@/utils/formatOptions";
import {
  formSessaoApresentacoesSchema,
  type FormSessaoApresentacoesSchema,
} from "./formSessaoApresentacoesSchema";

export interface ApresentacaoOpt {
  value: string;
  label: string;
  title: string;
  presenterName: string;
}

/**
 * Lógica do formulário de sessão: estado do form, lista ordenável de
 * apresentações (add/mover/remover), filtro de horário e submissão
 * (create/update). UI em `FormSessaoApresentacoes.tsx` + `ApresentacoesOrdenaveis`.
 */
export function useFormSessaoApresentacoes(
  disabledIntervals: { start: Date; end: Date }[],
) {
  const { createSession, updateSession, sessao, setSessao, roomsList } =
    useSession();
  const { userList } = useUsers();
  const { submissionList } = useSubmission();
  const { Edicao } = useEdicao();

  const defaultValues = sessao?.id
    ? {
        titulo: sessao?.title ?? "",
        apresentacoes: [],
        n_apresentacoes: sessao?.numPresentations ?? 0,
        sala: sessao?.roomId ?? "",
        inicio: sessao?.startTime ?? null,
        avaliadores: [],
      }
    : {
        inicio: null,
        n_apresentacoes: 0,
      };

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormSessaoApresentacoesSchema>({
    resolver: zodResolver(formSessaoApresentacoesSchema),
    defaultValues,
  });

  const salasOptions = formatOptions(roomsList, "name");
  const avaliadoresOptions = formatOptions(userList, "name");

  const apresentacoesOptions = useMemo<ApresentacaoOpt[]>(() => {
    return (submissionList || []).map((v) => {
      const presenterName = v?.mainAuthor?.name || "Apresentador não informado";
      const title = v?.title || "Título não informado";
      return { value: v.id, label: title, title, presenterName };
    });
  }, [submissionList]);

  const [orderedApresentacoes, setOrderedApresentacoes] = useState<
    ApresentacaoOpt[]
  >([]);

  const syncFormApresentacoes = (items: ApresentacaoOpt[]) => {
    setOrderedApresentacoes(items);
    setValue(
      "apresentacoes",
      items.map((i) => ({ value: i.value, label: i.label })),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  useEffect(() => {
    if (sessao?.id && sessao?.presentations?.length) {
      const loaded =
        sessao.presentations
          .toSorted((a, b) => a.positionWithinBlock - b.positionWithinBlock)
          .map((p) => {
            const presenterName =
              p.submission?.mainAuthor?.name || "Apresentador não informado";
            const title = p.submission?.title || "Título não informado";
            return {
              value: p.submission?.id ?? "",
              label: title,
              title,
              presenterName,
            };
          }) || [];
      syncFormApresentacoes(loaded);
    } else {
      syncFormApresentacoes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  const availableOptions = useMemo(() => {
    const selectedIds = new Set(orderedApresentacoes.map((a) => a.value));
    return apresentacoesOptions.filter((opt) => !selectedIds.has(opt.value));
  }, [apresentacoesOptions, orderedApresentacoes]);

  const addApresentacao = (id: string) => {
    const opt = apresentacoesOptions.find((o) => o.value === id);
    if (!opt) return;
    syncFormApresentacoes([...orderedApresentacoes, opt]);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...orderedApresentacoes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    syncFormApresentacoes(next);
  };

  const moveDown = (index: number) => {
    if (index >= orderedApresentacoes.length - 1) return;
    const next = [...orderedApresentacoes];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    syncFormApresentacoes(next);
  };

  const removeRow = (index: number) => {
    const next = orderedApresentacoes.filter((_, i) => i !== index);
    syncFormApresentacoes(next);
  };

  const combinedTimeFilter = (time: Date) => {
    const hour = time.getHours();
    const isWithinOperatingHours = hour < 22 && hour > 6;

    if (!isWithinOperatingHours) {
      return false;
    }

    const timeToCheck = time.getTime();
    const isTimeUnavailable = disabledIntervals.some((interval) => {
      const startTime = interval.start.getTime();
      const endTime = interval.end.getTime();
      return timeToCheck >= startTime && timeToCheck < endTime;
    });

    return !isTimeUnavailable;
  };

  const handleFormSessaoApresentacoes = (data: FormSessaoApresentacoesSchema) => {
    const { titulo, apresentacoes, sala, inicio, n_apresentacoes, avaliadores } =
      data;

    if (!Edicao?.id) return;
    if (!titulo || !sala || !inicio) {
      throw new Error("Campos obrigatórios em branco.");
    }

    const body = {
      type: "Presentation",
      eventEditionId: Edicao.id,
      title: titulo,
      submissions: apresentacoes?.length
        ? apresentacoes?.map((v) => v.value)
        : undefined,
      roomId: sala,
      startTime: inicio,
      numPresentations: n_apresentacoes,
      panelists: avaliadores?.length
        ? avaliadores?.map((v) => v.value)
        : undefined,
    } as SessaoParams;

    if (sessao?.id) {
      updateSession(sessao.id, Edicao.id, body).then((status) => {
        if (status) {
          reset();
          setSessao(null);
        }
      });
      return;
    }

    createSession(Edicao.id, body).then((status) => {
      if (status) {
        reset();
        setSessao(null);
      }
    });
  };

  useEffect(() => {
    if (sessao) {
      setValue("titulo", sessao?.title ?? "");
      setValue(
        "apresentacoes",
        sessao?.presentations?.map((v) => {
          const presenterName =
            v.submission?.mainAuthor?.name || "Apresentador não informado";
          const title = v.submission?.title || "Título não informado";
          return {
            value: v.submission?.id ?? "",
            label: title,
            title: title,
            presenterName: presenterName,
          };
        }),
      );
      setValue("n_apresentacoes", sessao?.duration ? sessao?.duration / 20 : 0);
      setValue("sala", sessao?.roomId);
      setValue("inicio", sessao?.startTime);
      setValue(
        "avaliadores",
        sessao?.panelists?.map((v) => {
          return { value: v.userId, label: v.user?.name ?? "" };
        }),
      );
    } else {
      setValue("titulo", "");
      setValue("apresentacoes", []);
      setValue("n_apresentacoes", 0);
      setValue("sala", "");
      setValue("inicio", "");
      setValue("avaliadores", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  return {
    register,
    control,
    errors,
    onSubmit: handleSubmit(handleFormSessaoApresentacoes),
    edicao: Edicao,
    salasOptions,
    avaliadoresOptions,
    orderedApresentacoes,
    availableOptions,
    addApresentacao,
    moveUp,
    moveDown,
    removeRow,
    combinedTimeFilter,
  };
}
