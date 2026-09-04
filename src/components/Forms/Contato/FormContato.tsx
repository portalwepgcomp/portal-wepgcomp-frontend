import { sendContactRequest } from "@/services/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSweetAlert } from "@/hooks/useAlert";
import { useEdicao } from "@/hooks/useEdicao";
import Button from "@/components/UI/Button";
import { Campo, Input, Textarea } from "@/components/UI/Input";
import { cn } from "@/utils/cn";

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

const campoClaro =
  "border-2 border-white bg-transparent text-lg text-white placeholder:text-white/70 shadow-sm";

export function FormContato() {
  const { Edicao } = useEdicao();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormContatoSchema>({
    resolver: zodResolver(formContatoSchema),
  });

  const { showAlert } = useSweetAlert();

  const handleFormContato = async (data: FormContatoSchema) => {
    sendContactRequest(data)
      .then((resp) => {
        if (resp.status < 200 || resp.status >= 300) {
          showAlert({
            icon: "error",
            title: "Erro ao enviar mensagem",
            text:
              resp?.response?.data?.message?.message ||
              resp?.response?.data?.message ||
              "Ocorreu um erro ao enviar o formulário. Tente novamente.",
            confirmButtonText: "Retornar",
          });
        } else {
          showAlert({
            icon: "success",
            title: "Mensagem enviada com sucesso!",
            timer: 3000,
            showConfirmButton: false,
          });
          reset();
        }
      })
      .catch((err) => {
        showAlert({
          icon: "error",
          title: "Erro ao enviar mensagem",
          text:
            err.response?.data?.message?.message ||
            err.response?.data?.message ||
            "Ocorreu um erro ao enviar o formulário. Tente novamente.",
          confirmButtonText: "Retornar",
        });
      });
  };

  return (
    <form
      className="mx-auto rounded-2xl border border-white p-8 shadow-lg"
      onSubmit={handleSubmit(handleFormContato)}
    >
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          label={<span className="text-xl font-semibold text-white">Nome:</span>}
          htmlFor="name"
          erro={errors.name?.message}
          className="mb-0"
        >
          <Input
            id="name"
            placeholder="Insira seu nome"
            className={campoClaro}
            {...register("name")}
          />
        </Campo>

        <Campo
          label={<span className="text-xl font-semibold text-white">E-mail:</span>}
          htmlFor="email"
          erro={errors.email?.message}
          className="mb-0"
        >
          <Input
            id="email"
            type="email"
            placeholder="Insira seu e-mail"
            className={campoClaro}
            {...register("email")}
          />
        </Campo>
      </div>

      <Campo
        label={<span className="text-xl font-semibold text-white">Mensagem:</span>}
        htmlFor="text"
        erro={errors.text?.message}
        className="mb-4"
      >
        <Textarea
          id="text"
          placeholder="Digite sua mensagem"
          rows={5}
          className={cn(campoClaro, "min-h-0 resize-none")}
          {...register("text")}
        />
      </Campo>

      <div className="mt-4 flex justify-center">
        <Button
          type="submit"
          disabled={!Edicao?.isActive}
          className={cn(
            "rounded-full border-2 border-white px-10 py-2 text-lg font-bold transition",
            Edicao?.isActive
              ? "bg-white text-[#1e1e1e] shadow-[0_2px_8px_rgba(255,255,255,0.2)] hover:opacity-90"
              : "cursor-not-allowed bg-[#bbb] text-[#1e1e1e]",
          )}
        >
          Enviar
        </Button>
      </div>
    </form>
  );
}
