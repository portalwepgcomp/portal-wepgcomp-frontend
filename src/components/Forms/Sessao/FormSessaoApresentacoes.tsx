"use client";

import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import Select from "react-select";

import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import ApresentacoesOrdenaveis from "./ApresentacoesOrdenaveis";
import {
  bloquearTeclasInvalidas,
  colarApenasNumeros,
  formatarEntradaNumerica,
} from "./formSessaoApresentacoesSchema";
import { useFormSessaoApresentacoes } from "./useFormSessaoApresentacoes";

const formAuxiliarFields = {
  titulo: {
    label: "Título",
    placeholder: "Insira o título da sua sessão",
  },
};

const formApresentacoesFields = {
  n_apresentacoes: {
    label: "Número máximo de apresentações para essa sessão",
    placeholder: "Ex. 4",
  },
  sala: {
    label: "Sala do evento",
    placeholder: "Selecione a sala do evento",
  },
  inicio: {
    label: "Data e horário de início da sessão",
    placeholder: "(ex.: 22/10/2024 20:00)",
  },
  avaliadores: {
    label: "Avaliadores",
    placeholder: "Selecione os avaliadores",
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

const datepickerClasse = selectClasse;

interface FormSessaoAuxiliarProps {
  disabledIntervals: { start: Date; end: Date }[];
}

export default function FormSessaoApresentacoes({
  disabledIntervals,
}: Readonly<FormSessaoAuxiliarProps>) {
  const {
    register,
    control,
    errors,
    onSubmit,
    edicao,
    salasOptions,
    avaliadoresOptions,
    orderedApresentacoes,
    availableOptions,
    addApresentacao,
    moveUp,
    moveDown,
    removeRow,
    combinedTimeFilter,
  } = useFormSessaoApresentacoes(disabledIntervals);

  return (
    <form className="grid grid-cols-1 gap-3" onSubmit={onSubmit}>
      <div className="mb-1">
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

        <ApresentacoesOrdenaveis
          availableOptions={availableOptions}
          orderedApresentacoes={orderedApresentacoes}
          addApresentacao={addApresentacao}
          moveUp={moveUp}
          moveDown={moveDown}
          removeRow={removeRow}
          erro={errors.apresentacoes?.message}
        />
      </div>

      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formApresentacoesFields.n_apresentacoes.label)}
          </span>
        }
        htmlFor="sa-n-apresentacoes"
        erro={errors.n_apresentacoes?.message}
        className="mb-1"
      >
        <Input
          type="number"
          id="sa-n-apresentacoes"
          placeholder={formApresentacoesFields.n_apresentacoes.placeholder}
          className="text-sm"
          min={1}
          step={1}
          inputMode="numeric"
          onKeyDown={bloquearTeclasInvalidas}
          onInput={formatarEntradaNumerica}
          onPaste={colarApenasNumeros}
          {...register("n_apresentacoes", {
            valueAsNumber: true,
          })}
        />
      </Campo>

      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formApresentacoesFields.sala.label)}
          </span>
        }
        htmlFor="sa-sala-select"
        erro={errors.sala?.message}
        className="mb-1"
      >
        <select id="sa-sala-select" className={selectClasse} {...register("sala")}>
          <option value="" hidden>
            {formApresentacoesFields.sala.placeholder}
          </option>
          {salasOptions?.map((op, i) => (
            <option id={`sala-op${i}`} key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </Campo>

      <Campo
        label={
          <span className="font-bold">
            {labelObrigatorio(formApresentacoesFields.inicio.label)}
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
              id="sa-inicio-data"
              showIcon
              onChange={(date) => field.onChange(date?.toISOString() || null)}
              selected={field.value ? new Date(field.value) : null}
              showTimeSelect
              className={datepickerClasse}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={dayjs(edicao?.startDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              maxDate={dayjs(edicao?.endDate || "")
                .tz("America/Sao_Paulo", true)
                .toDate()}
              isClearable
              filterTime={combinedTimeFilter}
              placeholderText={formApresentacoesFields.inicio.placeholder}
              toggleCalendarOnIconClick
            />
          )}
        />
      </Campo>

      <Campo
        label={
          <span className="font-bold">
            {formApresentacoesFields.avaliadores.label}
          </span>
        }
        erro={errors.avaliadores?.message}
        className="mb-1"
      >
        <Controller
          name="avaliadores"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              id="sa-avaliadores-select"
              isClearable
              placeholder={formApresentacoesFields.avaliadores.placeholder}
              options={avaliadoresOptions}
            />
          )}
        />
      </Campo>

      <div className="flex justify-center">
        <Button
          type="submit"
          id="sa-submit-button"
          disabled={!edicao?.isActive}
          className="bg-brand-orange hover:bg-brand-orange"
        >
          {confirmButton.label}
        </Button>
      </div>
    </form>
  );
}
