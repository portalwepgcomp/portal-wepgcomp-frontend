"use client";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";
import { startOfYear, endOfYear } from "date-fns";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import { useFormEdicao } from "./useFormEdicao";
import {
  bloquearTeclasInvalidas,
  colarApenasNumeros,
  datepickerClasse,
  formatarEntradaNumerica,
} from "./formEdicaoSchema";

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

registerLocale("pt-BR", ptBR);

interface FormEdicaoProps {
  edicaoData?: Edicao | null;
}

export function FormEdicao({ edicaoData }: Readonly<FormEdicaoProps>) {
  const {
    form,
    Edicao,
    comissaoOptions,
    salaInputValue,
    setSalaInputValue,
    handleSubmit,
    isValid,
    errors,
  } = useFormEdicao({ edicaoData });

  const { register, control } = form;

  return (
    <form
      className="grid w-3/4 grid-cols-1 gap-3"
      onSubmit={handleSubmit}
      id="form-edicao"
    >
      <Campo
        label={<span className="text-xl">{labelObrigatorio("Nome do evento")}</span>}
        htmlFor="nomeEvento"
        erro={errors.titulo?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="nomeEvento"
          placeholder="WEPGCOMP 202.."
          className="text-sm"
          {...register("titulo")}
        />
      </Campo>

      <Campo
        label={<span className="text-xl">{labelObrigatorio("Descrição do evento")}</span>}
        htmlFor="descricao"
        erro={errors.descricao?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="descricao"
          placeholder="Sobre o WEPGCOMP..."
          className="text-sm"
          {...register("descricao")}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            {labelObrigatorio("Data de início e fim do evento")}
          </span>
        }
        erro={errors.inicio?.message || errors.final?.message}
        className="mb-1"
      >
        <div className="flex flex-row flex-wrap justify-start gap-2">
          <Controller
            name="inicio"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="ed-inicio-data"
                onChange={(date) =>
                  field.onChange(dayjs(date).toISOString() || null)
                }
                selected={field.value ? dayjs(field.value).toDate() : null}
                showIcon
                className={datepickerClasse}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                minDate={startOfYear(new Date())}
                maxDate={endOfYear(new Date())}
                placeholderText="(ex.: 22/10/2024)"
                toggleCalendarOnIconClick
              />
            )}
          />
          <Controller
            name="final"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="ed-final-data"
                onChange={(date) =>
                  field.onChange(
                    dayjs(date).set("hour", 23).set("minute", 59).toISOString() ||
                      null,
                  )
                }
                selected={field.value ? dayjs(field.value).toDate() : null}
                showIcon
                className={datepickerClasse}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                minDate={startOfYear(new Date())}
                maxDate={endOfYear(new Date())}
                placeholderText="(ex.: 22/10/2024)"
                toggleCalendarOnIconClick
              />
            )}
          />
        </div>
      </Campo>

      <Campo
        label={<span className="text-xl">{labelObrigatorio("Local do evento")}</span>}
        htmlFor="local"
        erro={errors.local?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="local"
          placeholder="Digite o local do evento"
          className="text-sm"
          {...register("local")}
        />
      </Campo>

      <Campo
        label={<span className="text-xl">Sala(s) do evento</span>}
        erro={errors.salas?.message}
        className="mb-1"
      >
        <Controller
          name="salas"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              {...field}
              id="salas-select"
              isMulti
              placeholder="Digite a sala e aperte Enter"
              isClearable
              menuIsOpen={false}
              components={{ DropdownIndicator: null, IndicatorSeparator: null }}
              inputValue={salaInputValue}
              onInputChange={setSalaInputValue}
              onKeyDown={(event) => {
                if (event.key === "Enter" && salaInputValue) {
                  event.preventDefault();
                  field.onChange([
                    ...(field.value || []),
                    { label: salaInputValue, value: salaInputValue },
                  ]);
                  setSalaInputValue("");
                }
              }}
            />
          )}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">{labelObrigatorio("Comissão organizadora")}</span>
        }
        erro={errors.comissao?.message}
        className="mb-1"
      >
        <Controller
          name="comissao"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id="comissao-select"
              isMulti
              options={comissaoOptions}
              placeholder="Escolha o(s) usuário(s)"
              isClearable
            />
          )}
        />
      </Campo>

      <div className="flex flex-col justify-start">
        <div className="text-2xl">Sessões e apresentações</div>
        <div className="mt-3 flex flex-col justify-start gap-3">
          <Campo
            label={
              <span className="text-xl">{labelObrigatorio("Número de sessões")}</span>
            }
            htmlFor="quantidadeSessão"
            erro={errors.sessoes?.message}
            className="mb-1"
          >
            <Input
              type="number"
              id="quantidadeSessão"
              placeholder="Quantidade de sessões"
              className="text-sm"
              min={1}
              step={1}
              inputMode="numeric"
              onKeyDown={bloquearTeclasInvalidas}
              onInput={formatarEntradaNumerica}
              onPaste={colarApenasNumeros}
              {...register("sessoes", { valueAsNumber: true })}
            />
          </Campo>
          <Campo
            label={
              <span className="text-xl">
                {labelObrigatorio("Duração da Apresentação (minutos)")}
              </span>
            }
            htmlFor="sessao"
            erro={errors.duracao?.message}
            className="mb-1"
          >
            <Input
              type="number"
              id="sessao"
              placeholder="ex.: 20 minutos"
              className="text-sm"
              min={1}
              step={1}
              inputMode="numeric"
              onKeyDown={bloquearTeclasInvalidas}
              onInput={formatarEntradaNumerica}
              onPaste={colarApenasNumeros}
              {...register("duracao", { valueAsNumber: true })}
            />
          </Campo>
        </div>
      </div>

      <Campo
        label={
          <span className="text-xl">
            {labelObrigatorio("Texto da Chamada para Submissão de Trabalhos")}
          </span>
        }
        htmlFor="submissao"
        erro={errors.submissao?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="submissao"
          placeholder="Digite o texto aqui"
          className="text-sm"
          {...register("submissao")}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            {labelObrigatorio("Data limite para a submissão")}
          </span>
        }
        erro={errors.limite?.message}
        className="mb-1"
      >
        <Controller
          control={control}
          name="limite"
          render={({ field }) => (
            <DatePicker
              id="ed-deadline-data"
              showIcon
              onChange={(date) =>
                field.onChange(
                  dayjs(date).set("hour", 23).set("minute", 59).toISOString() ||
                    null,
                )
              }
              selected={field.value ? new Date(field.value) : null}
              placeholderText="(ex.: 22/10/2024)"
              className={cn(datepickerClasse, "w-full")}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              minDate={startOfYear(new Date())}
              maxDate={endOfYear(new Date())}
              toggleCalendarOnIconClick
            />
          )}
        />
      </Campo>

      <div className="mx-auto my-5 w-full max-w-xs">
        <Button
          type="submit"
          disabled={!Edicao?.isActive || !isValid}
          larguraTotal
          className="bg-brand-orange text-xl hover:bg-brand-orange"
        >
          Salvar
        </Button>
      </div>
    </form>
  );
}
