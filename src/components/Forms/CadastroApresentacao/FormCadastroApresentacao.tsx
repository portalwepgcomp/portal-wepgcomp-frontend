"use client";

import Button from "@/components/UI/Button";
import { Controller } from "react-hook-form";
import { InputMask } from "@react-input/mask";
import { CalendarDays, FileUp, Save, Sparkles, UserCheck } from "lucide-react";

import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { Campo, Input, Textarea } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import { useApresentacaoPdf } from "@/hooks/useApresentacaoPdf";
import { useFormCadastroApresentacao } from "./useFormCadastroApresentacao";

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error font-bold">*</span>
  </>
);

const selectClasse =
  "w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm leading-normal text-foreground transition-all duration-150 hover:border-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/15";

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
    sessoesDisponiveis,
    carregandoSessoes,
    erroSessoes,
    recarregarSessoes,
    haSessoesDeApresentacao,
    sessaoAnteriorIndisponivel,
    eventEditionId,
    nomeArquivo,
    submission,
    carregandoEnvio,
    edicaoAtiva,
    aoMudarArquivo,
    aoMudarTextarea,
  } = useFormCadastroApresentacao();

  const { baixarPdf, baixandoPdf } = useApresentacaoPdf();

  if (carregandoEnvio) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <IndicadorDeCarregamento />
        <p className="mt-4 text-sm font-semibold text-muted">
          Processando submissão e enviando arquivos...
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-8 w-full" onSubmit={onSubmit}>
      {/* Seção 1: Dados do Trabalho */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <Sparkles className="h-5 w-5 text-brand-orange" />
          <h2 className="text-base font-bold text-foreground">
            Dados da Pesquisa
          </h2>
        </div>

        {user?.level !== "Default" && (
          <Campo
            label={
              <span className="text-sm font-semibold text-foreground">
                {labelObrigatorio("Selecionar Apresentador")}
              </span>
            }
            htmlFor="apresentador-select"
          >
            <div className="relative">
              <select
                id="apresentador-select"
                className={selectClasse}
                {...register("apresentador")}
                disabled={loadingUserList}
              >
                <option value="">Selecione um autor/apresentador</option>
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
            </div>
          </Campo>
        )}

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Título da Pesquisa")}
            </span>
          }
          htmlFor="titulo"
          erro={errors.titulo?.message}
        >
          <Input
            type="text"
            id="titulo"
            placeholder="Ex.: Aplicação de Aprendizado Profundo no Diagnóstico Médico"
            className="text-sm rounded-lg"
            maxLength={300}
            {...register("titulo")}
          />
        </Campo>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Resumo")}
            </span>
          }
          htmlFor="resumo"
          erro={errors.resumo?.message}
        >
          <Textarea
            id="resumo"
            rows={5}
            placeholder="Descreva o contexto, objetivos, metodologia e resultados esperados da sua pesquisa..."
            className={cn("text-sm rounded-lg leading-relaxed")}
            maxLength={800}
            {...register("resumo")}
            onInput={aoMudarTextarea}
          />
        </Campo>
      </div>

      {/* Seção 2: Sessão de apresentação */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <CalendarDays className="h-5 w-5 text-brand-blue" />
          <h2 className="text-base font-bold text-foreground">
            Sessão de Apresentação
          </h2>
        </div>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Escolha uma sessão disponível")}
            </span>
          }
          htmlFor="sessao-select"
          erro={errors.sessao?.message}
        >
          <select
            id="sessao-select"
            className={selectClasse}
            aria-describedby="sessao-ajuda"
            disabled={
              !eventEditionId ||
              carregandoSessoes ||
              !!erroSessoes ||
              sessoesDisponiveis.length === 0
            }
            {...register("sessao")}
          >
            <option value="">Selecione uma sessão</option>
            {sessoesDisponiveis.map((sessao) => {
              const vagas = sessao.availablePositionsWithInBlock?.length ?? 0;
              const disponibilidade =
                vagas > 0
                  ? vagas + (vagas === 1 ? " vaga" : " vagas")
                  : "sessão atual, sem novas vagas";

              return (
                <option key={sessao.id} value={sessao.id}>
                  {(sessao.title || "Sessão de apresentações") +
                    " — " +
                    new Date(sessao.startTime).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }) +
                    " — " +
                    disponibilidade}
                </option>
              );
            })}
          </select>
          <p id="sessao-ajuda" className="mt-2 text-xs text-muted">
            Escolha uma sessão desta edição com vaga para sua apresentação.
          </p>
          {!eventEditionId && (
            <p role="alert" className="mt-2 text-sm text-error">
              Não foi possível identificar a edição atual.
            </p>
          )}
          {eventEditionId && carregandoSessoes && (
            <p role="status" className="mt-2 text-sm text-muted">
              Carregando sessões disponíveis...
            </p>
          )}
          {eventEditionId && erroSessoes && (
            <div role="alert" className="mt-2 text-sm text-error">
              Não foi possível carregar as sessões.{" "}
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => void recarregarSessoes()}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {eventEditionId &&
            !carregandoSessoes &&
            !erroSessoes &&
            sessoesDisponiveis.length === 0 && (
              <p role="status" className="mt-2 text-sm text-error">
                {haSessoesDeApresentacao
                  ? "As sessões desta edição estão sem vagas no momento."
                  : "Nenhuma sessão de apresentação cadastrada para esta edição."}
              </p>
            )}
          {sessaoAnteriorIndisponivel && (
            <p role="status" className="mt-2 text-sm text-error">
              A sessão escolhida anteriormente não possui mais vagas. Selecione
              outra sessão.
            </p>
          )}
        </Campo>
      </div>

      {/* Seção 3: Orientação e Contato */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <UserCheck className="h-5 w-5 text-brand-blue" />
          <h2 className="text-base font-bold text-foreground">
            Orientação e Contato
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo
            label={
              <span className="text-sm font-semibold text-foreground">
                {labelObrigatorio("Professor Orientador")}
              </span>
            }
            htmlFor="orientador-select"
            erro={errors.orientador?.message}
          >
            <select
              id="orientador-select"
              className={selectClasse}
              {...register("orientador")}
            >
              <option value="">Selecione o orientador</option>
              {advisors.map((orientador) => (
                <option key={orientador.id} value={orientador.id}>
                  {orientador.name}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            label={
              <span className="text-sm font-semibold text-foreground">
                Coorientador{" "}
                <span className="text-xs font-normal text-muted">
                  (opcional)
                </span>
              </span>
            }
            htmlFor="coorientador"
          >
            <Controller
              name="coorientador"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  type="text"
                  id="coorientador"
                  placeholder="Nome do coorientador"
                  className="text-sm rounded-lg"
                  value={value ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const apenasLetras = e.target.value.replace(
                      /[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g,
                      "",
                    );
                    onChange(apenasLetras);
                  }}
                  onBlur={onBlur}
                />
              )}
            />
          </Campo>
        </div>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Celular para Contato / WhatsApp")}
            </span>
          }
          htmlFor="celular"
          erro={errors.celular?.message}
        >
          <div className="relative">
            <Controller
              name="celular"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <InputMask
                  component={Input}
                  ref={ref}
                  id="celular"
                  placeholder="(XX) 9XXXX-XXXX"
                  className="text-sm rounded-lg"
                  mask="(__) c____-____"
                  replacement={{ _: /\d/, c: /9/ }}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  aria-describedby="celular-ajuda"
                  value={value ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                  }
                  onBlur={onBlur}
                />
              )}
            />
          </div>
          <p id="celular-ajuda" className="text-xs text-muted">
            Informe o DDD e um celular com 9 dígitos. Números repetidos não são
            aceitos.
          </p>
        </Campo>
      </div>

      {/* Seção 4: Slides e Links */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <FileUp className="h-5 w-5 text-brand-orange" />
          <h2 className="text-base font-bold text-foreground">
            Arquivos e Material de Apresentação
          </h2>
        </div>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              Link de Apoio / Hospedagem{" "}
              <span className="text-xs font-normal text-muted">
                (Google Drive, OneDrive, etc. - opcional)
              </span>
            </span>
          }
          htmlFor="linkApresentacao"
          erro={errors.linkApresentacao?.message}
        >
          <Input
            type="text"
            id="linkApresentacao"
            placeholder="https://drive.google.com/..."
            className="text-sm rounded-lg"
            {...register("linkApresentacao")}
          />
        </Campo>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Slide da Apresentação em PDF")}
            </span>
          }
          htmlFor="slide"
          erro={errors.slide?.message}
        >
          <div className="rounded-xl border-2 border-dashed border-line bg-muted-light/20 p-5 transition-colors duration-200 hover:border-brand-blue/60">
            <input
              type="file"
              id="slide"
              accept="application/pdf,.pdf"
              className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand-blue/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
              onChange={aoMudarArquivo}
            />

            {nomeArquivo && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-card p-3 border border-line text-sm text-foreground">
                <FileUp className="h-4 w-4 text-brand-orange shrink-0" />
                <span className="truncate">
                  Arquivo selecionado: <strong>{nomeArquivo}</strong>
                </span>
                {submission?.id && (
                  <button
                    type="button"
                    onClick={() => baixarPdf(submission.id, nomeArquivo)}
                    disabled={baixandoPdf}
                    className="ml-auto text-xs font-semibold text-brand-blue hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Baixar atual
                  </button>
                )}
              </div>
            )}
          </div>
        </Campo>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-6">
        <Button
          size="lg"
          variante="primary"
          type="submit"
          disabled={
            !edicaoAtiva ||
            !eventEditionId ||
            carregandoSessoes ||
            !!erroSessoes ||
            sessoesDisponiveis.length === 0
          }
        >
          <Save />
          <span>
            {submission && submission?.id
              ? "Salvar Alterações"
              : "Concluir Submissão"}
          </span>
        </Button>
      </div>
    </form>
  );
}
