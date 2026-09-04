import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

type Variante = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  larguraTotal?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition duration-base disabled:opacity-50 disabled:cursor-not-allowed";

const variantes: Record<Variante, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover hover:shadow-md hover:-translate-y-px",
  ghost:
    "bg-transparent text-foreground hover:bg-muted-light",
  danger:
    "bg-error text-white hover:opacity-90 hover:shadow-md",
};

/**
 * Botão base do design system, 100% Tailwind.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = "primary", larguraTotal = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variantes[variante], larguraTotal && "w-full", className)}
      {...props}
    />
  );
});

export default Button;
