"use client";

import Button from "@/components/UI/Button";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Award, Save, Users } from "lucide-react";

import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useSweetAlert } from "@/hooks/useAlert";
import { usePremiacao } from "@/hooks/usePremiacao";
import { registrarErro } from "@/utils/logError";
import { AvaliadorParams } from "@/models/premiacao";
import { OptionType } from "@/models/forms";

const formMelhorAvaliadorSchema = z.object({
  avaliadores: z
    .array(
      z.object({
        label: z.string(),
        value: z.string({
          invalid_type_error: "Campo inválido!",
        }),
      }),
    )
    .max(3, { message: "Você deve selecionar no máximo 3 avaliadores!" }),
  eventEditionId: z.string(),
});

type FormMelhorAvaliadorSchema = z.infer<typeof formMelhorAvaliadorSchema>;

export function FormMelhorAvaliador() {
  const router = useRouter();
  const { showAlert } = useSweetAlert();
  const { user } = useContext(AuthContext);
  const [panelistsLoaded, setPanelistsLoaded] = useState(false);
  const { createAwardedPanelists, getPanelists, listPanelists } = usePremiacao();

  const [avaliadoresOptions, setAvaliadoresOptions] = useState<OptionType[]>([]);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormMelhorAvaliadorSchema>({
    resolver: zodResolver(formMelhorAvaliadorSchema),
    defaultValues: {
      eventEditionId: getEventEditionIdStorage() ?? "",
      avaliadores: [],
    },
  });

  const selectedAvaliadores = watch("avaliadores") || [];

  useEffect(() => {
    if (!panelistsLoaded) {
      getPanelists(getEventEditionIdStorage() ?? "");
      setPanelistsLoaded(true);
    }
  }, [panelistsLoaded, getPanelists]);

  const handleFormAvaliadores = async (data: FormMelhorAvaliadorSchema) => {
    const { avaliadores, eventEditionId } = data;

    const body = {
      eventEditionId,
      panelists: avaliadores?.map((v) => ({ userId: v.value })) || [],
    } as AvaliadorParams;

    if (!user) {
      showAlert({
        icon: "error",
        text: "Você precisa estar logado para escolher os avaliadores.",
        confirmButtonText: "Retornar",
      });
      return;
    }

    if (avaliadores?.length > 3) {
      showAlert({
        icon: "error",
        text: "Você deve selecionar até 3 avaliadores.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (eventEditionId) {
      await createAwardedPanelists(body);
      showAlert({
        icon: "success",
        title: "Premiação Salva!",
        text: "Os avaliadores homenageados foram registrados com sucesso.",
      }).then(() => {
        router.push("/premiacao");
      });
    }
  };

  useEffect(() => {
    if (listPanelists.length > 0) {
      const users = listPanelists.map((v) => ({
        value: v.id ?? "",
        label: v.name ?? "",
      }));
      setAvaliadoresOptions(users);
    }
  }, [listPanelists]);

  const onInvalid = () =>
    registrarErro("Validação do formulário de melhores avaliadores falhou", null);

  return (
    <form
      className="space-y-6 w-full"
      id="avaliadores-form"
      onSubmit={handleSubmit(handleFormAvaliadores, onInvalid)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-blue" />
            Selecione os Membros da Banca
          </label>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              selectedAvaliadores.length > 3
                ? "bg-red-100 text-red-700"
                : "bg-brand-blue/10 text-brand-blue"
            }`}
          >
            {selectedAvaliadores.length} / 3 selecionados
          </span>
        </div>

        <Controller
          name="avaliadores"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id="melhoresAvaliadores-select"
              isMulti
              menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#0066ba" : "#d9dce0",
                  borderRadius: "0.5rem",
                  padding: "0.125rem",
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 102, 186, 0.15)" : "none",
                }),
              }}
              options={avaliadoresOptions}
              placeholder="Digite ou selecione os nomes dos avaliadores..."
              isClearable
              onChange={(selected) => field.onChange(selected)}
              value={field.value || []}
            />
          )}
        />
        {errors.avaliadores?.message && (
          <p className="mt-1 text-sm text-error font-medium">
            {errors.avaliadores.message}
          </p>
        )}
      </div>

      {/* Selected Preview Chips */}
      {selectedAvaliadores.length > 0 && (
        <div className="rounded-xl border border-line bg-muted-light/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Avaliadores que receberão o certificado de destaque:
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {selectedAvaliadores.map((av, idx) => (
              <div
                key={av.value}
                className="flex items-center gap-2.5 rounded-lg bg-card p-3 border border-line shadow-2xs"
              >
                <Award className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted font-medium">Destaque #{idx + 1}</p>
                  <p className="text-sm font-bold text-foreground truncate">{av.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-6">
        <Button size="lg" variante="primary"
          type="submit"
          disabled={isSubmitting}
        >
          <Save  />
          <span>Salvar Premiação</span>
        </Button>
      </div>
    </form>
  );
}
