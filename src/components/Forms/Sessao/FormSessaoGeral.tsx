"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useSession } from "@/hooks/useSession";
import { useRoomsQuery } from "@/features/sessoes/hooks/useRoomsQuery";

import { getDurationInMinutes } from "@/utils/formatDate";
import { formatOptions } from "@/utils/formatOptions";
import { useEffect } from "react";
import { useEdicao } from "@/hooks/useEdicao";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PresentationBlockParams } from "@/models/session";

dayjs.extend(utc);
dayjs.extend(timezone);

const formAuxiliarFields = {
  titulo: {
    label: "Título",
    placeholder: "Insira o título da sua sessão",
  },
  nome: {
    label: "Nome do(a) palestrante",
    placeholder: "Insira o título do(a) palestrante",
  },
  sala: {
    label: "Sala do evento",
    placeholder: "Selecione a sala do evento",
  },
  inicio: {
    label: "Data e horário de início da sessão",
    placeholder: "(ex.: 22/10/2024 20:00)",
  },
  final: {
    label: "Data e horário de fim da sessão",
    placeholder: "(ex.: 22/10/2024 20:00)",
  },
};

const confirmButton = { label: "Salvar" };

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

const selectClasse =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-sm leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

const datepickerClasse =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-sm leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

const MAX_SESSION_DURATION_MINUTES = 720;

const formSessaoAuxiliarSchema = z
  .object({
    titulo: z
      .string({
        invalid_type_error: "Campo inválido!",
      })
      .min(1, "Título é obrigatório."),

    nome: z
      .string({
        invalid_type_error: "Campo inválido!",
      })
      .optional(),

    sala: z
      .string({
        invalid_type_error: "Campo inválido!",
      })
      .min(1, "Sala é obrigatória!"),

    inicio: z
      .string({
        invalid_type_error: "Campo inválido!",
      })
      .datetime({
        message: "Data ou horário inválidos!",
      })
      .min(1, "Data e horário de início são obrigatórios!")
      .nullable(),

    final: z
      .string({
        invalid_type_error: "Campo inválido!",
      })
      .datetime({
        message: "Data ou horário inválidos!",
      })
      .min(1, "Data e horário de final são obrigatórios!")
      .nullable(),
  })
  .refine(
    (data) => {
      if (!data.inicio || !data.final) return true;
      const inicio = new Date(data.inicio).getTime();
      const final = new Date(data.final).getTime();
      return final > inicio;
    },
    {
      message: "A data e horário de fim devem ser posteriores ao início.",
      path: ["final"],
    },
  )
  .refine(
    (data) => {
      if (!data.inicio || !data.final) return true;
      return getDurationInMinutes(data.inicio, data.final) <= MAX_SESSION_DURATION_MINUTES;
    },
    {
      message: "A sessão não pode durar mais que 12 horas.",
      path: ["final"],
    },
  );

interface FormSessaoAuxiliarProps {
  disabledIntervals: { start: Date; end: Date }[];
}

export default function FormSessaoAuxiliar({
  disabledIntervals,
}: Readonly<FormSessaoAuxiliarProps>) {
  const { createSession, updateSession, sessao, setSessao } =
    useSession();
  const { Edicao } = useEdicao();
  const router = useRouter();
  const eventEditionId = sessao?.eventEditionId || Edicao?.id;
  const { data: rooms } = useRoomsQuery(eventEditionId);

  type FormSessaoAuxiliarSchema = z.infer<typeof formSessaoAuxiliarSchema>;

  const defaultValues = sessao?.id
    ? {
        titulo: sessao?.title ?? "",
        nome: sessao?.speakerName ?? "",
        sala: sessao?.roomId ?? "",
        inicio: sessao?.startTime ?? null,
        final: sessao?.startTime ?? null,
      }
    : {
        inicio: null,
        final: null,
      };

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormSessaoAuxiliarSchema>({
    resolver: zodResolver(formSessaoAuxiliarSchema),
    defaultValues,
  });

  const roomsOptions = formatOptions(rooms ?? [], "name");

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

  const handleFormSessaoAuxiliar = (data: FormSessaoAuxiliarSchema) => {
    const { titulo, nome, sala, inicio, final } = data;

    if (!Edicao?.id) return;
    if (!titulo || !sala || !inicio || !final) {
      throw new Error("Campos obrigatórios em branco.");
    }

    const duration = getDurationInMinutes(inicio, final);

    const body = {
      type: "General",
      eventEditionId: Edicao.id,
      title: titulo,
      speakerName: nome,
      roomId: sala,
      startTime: inicio,
      duration,
    } as PresentationBlockParams;

    if (sessao?.id) {
      updateSession(sessao.id, Edicao.id, body).then((status) => {
        if (status) {
          reset();
          setSessao(null);
          router.push("/sessoes");
        }
      });
      return;
    }

    createSession(Edicao.id, body).then((status) => {
      if (status) {
        reset();
        setSessao(null);
        router.push("/sessoes");
      }
    });
  };

  useEffect(() => {
    if (sessao) {
      setValue("titulo", sessao?.title ?? "");
      setValue("nome", sessao?.speakerName ?? "");
      setValue("sala", sessao?.roomId);
      setValue("inicio", sessao?.startTime);
      setValue(
        "final",
        dayjs(sessao?.startTime)
          .add(sessao?.duration ?? 0, "minute")
          .toISOString(),
      );
    } else {
      setValue("titulo", "");
      setValue("nome", "");
      setValue("sala", "");
      setValue("inicio", "");
      setValue("final", "");
    }
  }, [sessao, setValue]);

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={handleSubmit(handleFormSessaoAuxiliar)}
    >
      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formAuxiliarFields.titulo.label)}
          </span>
        }
        htmlFor="sg-titulo-input"
        erro={errors.titulo?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="sg-titulo-input"
          placeholder={formAuxiliarFields.titulo.placeholder}
          className="text-sm"
          {...register("titulo")}
        />
      </Campo>

      <Campo
        label={
          <span className="font-bold">{formAuxiliarFields.nome.label}</span>
        }
        htmlFor="sg-nome-input"
        erro={errors.nome?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="sg-nome-input"
          placeholder={formAuxiliarFields.nome.placeholder}
          className="text-sm"
          {...register("nome")}
        />
      </Campo>

      <Campo
        label={
          <span className="font-bold">{formAuxiliarFields.sala.label}</span>
        }
        htmlFor="sg-sala-select"
        erro={errors.sala?.message}
        className="mb-1"
      >
        <select
          id="sg-sala-select"
          className={selectClasse}
          {...register("sala")}
        >
          <option value="" hidden>
            {formAuxiliarFields.sala.placeholder}
          </option>
          {roomsOptions?.map((op, i) => (
            <option id={`sala-op${i}`} key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </Campo>

      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formAuxiliarFields.inicio.label)}
          </span>
        }
        erro={errors.inicio?.message}
        className="mb-1"
      >
        <Controller
          control={control}
          name="inicio"
          render={({ field }) => (
            <DatePicker
              id="sg-inicio-data"
              showIcon
              onChange={(date) => field.onChange(date?.toISOString() || null)}
              selected={field.value ? new Date(field.value) : null}
              showTimeSelect
              className={datepickerClasse}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={dayjs(Edicao?.startDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              maxDate={dayjs(Edicao?.endDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              isClearable
              filterTime={(time) =>
                field.value ? combinedTimeFilter(time) : false
              }
              placeholderText={formAuxiliarFields.inicio.placeholder}
              toggleCalendarOnIconClick
            />
          )}
        />
      </Campo>

      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formAuxiliarFields.final.label)}
          </span>
        }
        erro={errors.final?.message}
        className="mb-1"
      >
        <Controller
          control={control}
          name="final"
          render={({ field }) => (
            <DatePicker
              id="sg-final-data"
              showIcon
              onChange={(date) => field.onChange(date?.toISOString() || null)}
              selected={field.value ? new Date(field.value) : null}
              showTimeSelect
              className={datepickerClasse}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={dayjs(Edicao?.startDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              maxDate={dayjs(Edicao?.endDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              isClearable
              filterTime={(time) =>
                field.value ? combinedTimeFilter(time) : false
              }
              placeholderText={formAuxiliarFields.final.placeholder}
              toggleCalendarOnIconClick
            />
          )}
        />
      </Campo>

      <div className="flex justify-center">
        <Button size="lg" variante="primary"
          type="submit"
          id="sg-submit-button"
          disabled={!Edicao?.isActive}
        >
          {confirmButton.label}
        </Button>
      </div>
    </form>
  );
}
