import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useModal } from "@/context/ModalProvider";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import PasswordEye from "@/components/UI/PasswordEye";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formLoginSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Campo inválido!",
    })
    .min(1, "Verifique seu email")
    .email({
      message: "Verifique seu email",
    }),
  password: z
    .string({
      invalid_type_error: "Campo inválido",
    })
    .min(1, {
      message: "Verifique sua senha",
    }),
});

type FormLoginSchema = z.infer<typeof formLoginSchema>;

export function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
  });
  const { singIn, signed } = useContext(AuthContext);
  const { open } = useModal("alterarSenhaModal");
  const router = useRouter();

  const [eye, setEye] = useState(false);

  useEffect(() => {
    if (signed) {
      router.push("/home");
    }
  }, [signed, router]);

  async function handleLogin(data: UserLogin) {
    const { email, password } = data;
    const usuario: UserLogin = { email, password };

    try {
      await singIn(usuario);
    } catch {
      /* erro tratado no contexto */
    }
  }

  if (signed) {
    return null;
  }

  return (
    <form className="w-full max-w-[583px]" onSubmit={handleSubmit(handleLogin)}>
      <Campo
        label={
          <>
            E-mail <span className="text-error">*</span>
          </>
        }
        htmlFor="email"
        erro={errors.email?.message}
        className="mb-3"
      >
        <Input
          type="email"
          id="email"
          placeholder="exemplo@ufba.br"
          className="text-sm"
          {...register("email")}
        />
      </Campo>

      <Campo
        label={
          <>
            Senha <span className="text-error">*</span>
          </>
        }
        htmlFor="password"
        erro={errors.password?.message}
        className="mb-3"
      >
        <div className="flex flex-row items-center gap-1 rounded-md border border-[#e4e4e4] px-1">
          <input
            type={eye ? "text" : "password"}
            id="password"
            placeholder="digite sua senha"
            className="flex-1 border-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[#ADB5BD]"
            {...register("password")}
          />
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-1"
            onClick={() => setEye(!eye)}
            aria-label={eye ? "Ocultar senha" : "Mostrar senha"}
          >
            <PasswordEye color={eye ? "blue" : "black"} />
          </button>
        </div>
      </Campo>

      <div className="mb-4 text-end">
        <button
          type="button"
          onClick={() => open()}
          className="mt-1 border-0 bg-transparent p-0 text-sm text-[#090DF0] underline-offset-2 hover:underline"
        >
          Esqueceu sua senha?
        </button>
      </div>

      <div className="mx-auto mb-4 flex justify-center gap-2">
        <Button
          type="submit"
          className="h-[2.375rem] w-[7.938rem] bg-brand-blue text-sm font-semibold hover:bg-brand-blue"
        >
          Entrar
        </Button>
      </div>

      <hr className="border-[0.12rem] border-brand-orange" />
    </form>
  );
}
