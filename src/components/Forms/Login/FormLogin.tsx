"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import Button from "@/components/UI/Button";
import { Campo, Input, PasswordInput } from "@/components/UI/Input";
import { UserLogin } from "@/models/user";

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
  const router = useRouter();

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
      /* Erro de autenticação já é tratado no AuthProvider */
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
        <PasswordInput
          id="password"
          placeholder="digite sua senha"
          {...register("password")}
        />
      </Campo>

      <div className="mb-4 text-end">
        <Link
          href="/recuperar-senha"
          className="mt-1 text-sm text-[#090DF0] no-underline underline-offset-2 hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="mx-auto mb-4 flex justify-center gap-2">
        <Button size="lg" className="w-[224px]"
          type="submit"
          variante="primary"
        >
          Entrar
        </Button>
      </div>

      <hr className="border-[0.12rem] border-brand-orange" />
    </form>
  );
}
