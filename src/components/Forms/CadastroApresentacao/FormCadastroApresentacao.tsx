"use client";

import { Controller } from "react-hook-form";
import InputMask from "react-input-mask";

import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import Button from "@/components/UI/Button";
import { Campo, Input, Textarea } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import { useFormCadastroApresentacao } from "./useFormCadastroApresentacao";

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

const selectClasse =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-sm leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

export function FormCadastroApresentacao() {
  const {
    register,
    control,
    errors,
    onSubmit,
    user,
    loadingUserList,
    opcoesApresentadoresSelect,
    advisors,
    nomeArquivo,
    submission,
    carregandoEnvio,
    edicaoAtiva,
    aoMudarArquivo,
    aoMudarTextarea,
    tituloModal,
  } = useFormCadastroApresentacao();

  if (carregandoEnvio) {
    return <IndicadorDeCarregamento />;
  }

  return (
    <form className="grid grid-cols-1" onSubmit={onSubmit}>
      <h3 className="mb-4 text-center text-xl font-bold">{tituloModal}</h3>

      {user?.level !== "Default" && (
        <Campo
          label={
            <span className="text-xl">
              {labelObrigatorio("Selecionar apresentador")}
            </span>
          }
          htmlFor="apresentador-select"
          className="mb-1"
        >
          <select
            id="apresentador-select"
            className={selectClasse}
            {...register("apresentador")}
            disabled={loadingUserList}
          >
            <option value="">Selecione um apresentador</option>
            {opcoesApresentadoresSelect.length === 0 && !loadingUserList ? (
              <option value="" disabled>
                Nenhum apresentador encontrado
              </option>
            ) : (
              opcoesApresentadoresSelect.map((apresentador) => (
                <option key={apresentador.id} value={apresentador.id}>
                  {apresentador.displayLabel}
                </option>
              ))
            )}
          </select>
        </Campo>
      )}

      <Campo
        label={
          <span className="text-xl">
            {labelObrigatorio("Título da pesquisa")}
          </span>
        }
        htmlFor="titulo"
        erro={errors.titulo?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="titulo"
          placeholder="Insira o título da pesquisa"
          className="text-sm"
          {...register("titulo")}
        />
      </Campo>

      <Campo
        label={<span className="text-xl">{labelObrigatorio("Resumo")}</span>}
        htmlFor="resumo"
        erro={errors.resumo?.message}
        className="mb-1"
      >
        <Textarea
          id="resumo"
          placeholder="Insira o resumo da pesquisa"
          className={cn("min-h-0 text-sm", "overflow-y-hidden")}
          {...register("resumo")}
          onInput={aoMudarTextarea}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            {labelObrigatorio("Nome do orientador")}
          </span>
        }
        htmlFor="orientador-select"
        erro={errors.orientador?.message}
        className="mb-1"
      >
        <select
          id="orientador-select"
          className={selectClasse}
          {...register("orientador")}
        >
          <option value="">Selecione o nome do orientador</option>
          {advisors.map((orientador) => (
            <option key={orientador.id} value={orientador.id}>
              {orientador.name}
            </option>
          ))}
        </select>
      </Campo>

      <Campo
        label={<span className="text-xl">Nome do coorientador</span>}
        htmlFor="coorientador"
        className="mb-1"
      >
        <Input
          type="text"
          id="coorientador"
          placeholder="Insira o nome do coorientador"
          className="text-sm"
          {...register("coorientador")}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            Link da apresentação <span className="text-xs">(Google Drive)</span>
          </span>
        }
        htmlFor="linkApresentacao"
        erro={errors.linkApresentacao?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="linkApresentacao"
          placeholder="Link da apresentação no Drive/Dropbox/etc..."
          className="text-sm"
          {...register("linkApresentacao")}
        />
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            Slide da apresentação <span className="text-xs">(PDF)</span>{" "}
            <span className="text-error">*</span>
          </span>
        }
        htmlFor="slide"
        erro={errors.slide?.message}
        className="mb-1"
      >
        <Input
          type="file"
          id="slide"
          accept=".pdf"
          className="text-sm"
          onChange={aoMudarArquivo}
        />
        {submission && submission.id
          ? nomeArquivo && (
              <p className="mt-1 block max-w-full break-all text-sm">
                Arquivo selecionado:{" "}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${nomeArquivo}`}
                  download
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {nomeArquivo}
                </a>
              </p>
            )
          : nomeArquivo && (
              <p className="mt-1 block max-w-full break-all text-sm">
                Arquivo selecionado: {nomeArquivo}
              </p>
            )}
      </Campo>

      <Campo
        label={
          <span className="text-xl">
            Celular <span className="text-xs">(preferência WhatsApp)</span>{" "}
            <span className="text-error">*</span>
          </span>
        }
        htmlFor="celular"
        erro={errors.celular?.message}
        className="mb-1"
      >
        <Controller
          name="celular"
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <InputMask
              mask="(99) 99999-9999"
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              maskChar=" "
            >
              {(inputProps) => (
                <Input
                  {...inputProps}
                  ref={ref}
                  id="celular"
                  placeholder="(XX) XXXXX-XXXX"
                  className="text-sm"
                />
              )}
            </InputMask>
          )}
        />
      </Campo>

      <div className="mx-auto mt-12 w-full max-w-xs">
        <Button
          type="submit"
          disabled={!edicaoAtiva}
          larguraTotal
          className="bg-brand-orange text-xl hover:bg-brand-orange"
        >
          {submission && submission?.id ? "Alterar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
