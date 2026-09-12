"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "@/utils/cn";
import {
  buttonVariants,
  resolverVarianteBotao,
  type VarianteBotao,
} from "@/lib/estilosBotao";

export { buttonVariants } from "@/lib/estilosBotao";
export type { VarianteBotao } from "@/lib/estilosBotao";

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  /** Compatibilidade com os usos existentes; novos usos podem usar variant. */
  variante?: VarianteBotao;
  larguraTotal?: boolean;
};

// forwardRef mantém a referência funcional no React 18 usado pelo portal.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, variante, size = "lg", larguraTotal = false, type = "button", ...props },
  ref,
) {
  return (
    <ButtonPrimitive
      ref={ref}
      type={type}
      data-slot="button"
      className={(state) => twMerge(cn(
        buttonVariants({ variant: variant ?? resolverVarianteBotao(variante), size }),
        larguraTotal && "w-full",
        typeof className === "function" ? className(state) : className,
      ))}
      {...props}
    />
  );
});

export { Button };
export default Button;
