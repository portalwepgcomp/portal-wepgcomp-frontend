"use client";

import { sendContactRequest } from "@/services/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSweetAlert } from "@/hooks/useAlert";
import { useEdicao } from "@/hooks/useEdicao";
import Button from "@/components/UI/Button";
import { Campo, Input, Textarea } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";

const formContatoSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório!" })
    .min(1, { message: "Nome é obrigatório!" }),
  email: z
    .string({ required_error: "E-mail é obrigatório!" })
    .min(1, { message: "E-mail é obrigatório!" })
    .email({ message: "E-mail inválido!" }),
  text: z
    .string({ required_error: "A mensagem é obrigatória!" })
    .min(1, { message: "A mensagem não pode ser vazia!" }),
});

type FormContatoSchema = z.infer<typeof formContatoSchema>;

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange";

export function FormContato() {
  const { Edicao } = useEdicao();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormContatoSchema>({
    resolver: zodResolver(formContatoSchema),
  });

  const { showAlert } = useSweetAlert();

  const handleFormContato = async (data: FormContatoSchema) => {
    try {
      await sendContactRequest(data);
      showAlert({
        icon: "success",
        title: "Mensagem enviada com sucesso!",
        text: "Obrigado pelo contato! Responderemos em breve.",
        timer: 3000,
        showConfirmButton: false,
      });
      reset();
    } catch (err: unknown) {
      showAlert({
        icon: "error",
        title: "Erro ao enviar mensagem",
        text: getErrorMessage(
          err,
          "Ocorreu um erro ao enviar o formulário. Tente novamente mais tarde.",
        ),
        confirmButtonText: "Fechar",
      });
    }
  };

  return (
    <form
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit(handleFormContato)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          label={<span className="text-sm font-medium text-slate-700">Seu Nome:</span>}
          htmlFor="name"
          erro={errors.name?.message}
          className="mb-0"
        >
          <Input
            id="name"
            placeholder="Ex: Maria Silva"
            className={inputClass}
            {...register("name")}
          />
        </Campo>

        <Campo
          label={<span className="text-sm font-medium text-slate-700">Seu E-mail:</span>}
          htmlFor="email"
          erro={errors.email?.message}
          className="mb-0"
        >
          <Input
            id="email"
            type="email"
            placeholder="exemplo@ufba.br"
            className={inputClass}
            {...register("email")}
          />
        </Campo>
      </div>

      <Campo
        label={<span className="text-sm font-medium text-slate-700">Mensagem:</span>}
        htmlFor="text"
        erro={errors.text?.message}
        className="mb-1"
      >
        <Textarea
          id="text"
          placeholder="Escreva sua dúvida, sugestão ou informação..."
          rows={4}
          className={cn(inputClass, "min-h-[110px] resize-none")}
          {...register("text")}
        />
      </Campo>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={!Edicao?.isActive || isSubmitting}
          className={cn(
            "rounded-lg px-7 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm",
            Edicao?.isActive
              ? "bg-brand-orange text-white hover:bg-brand-orange/90 hover:shadow active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-300 text-slate-500",
          )}
        >
          {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
        </Button>
      </div>
    </form>
  );
}
