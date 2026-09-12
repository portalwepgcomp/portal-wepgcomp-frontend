import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Variantes do shadcn adaptadas ao Tailwind 3 e às cores do portal.
// Mantidas fora do componente client para uso em links e no SweetAlert.
const buttonStyles = cva(
  "botao group/button inline-flex shrink-0 items-center justify-center rounded-[var(--button-radius-lg)] border border-transparent bg-clip-padding px-4 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-blue-800 focus-visible:ring-[3px] focus-visible:ring-blue-800/50 [&:active:not([aria-haspopup])]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-[invalid=true]:border-red-700 aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-red-700/20 dark:aria-[invalid=true]:border-red-700/50 dark:aria-[invalid=true]:ring-red-700/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-blue-800 text-white hover:bg-blue-900",
        outline:
          "border-orange-700 bg-transparent text-orange-700 hover:bg-orange-50 aria-expanded:bg-orange-50",
        secondary:
          "bg-orange-700 text-white hover:bg-orange-800 aria-expanded:bg-orange-800 aria-expanded:text-white",
        ghost:
          "bg-transparent text-gray-800 hover:bg-gray-100 hover:text-gray-600 aria-expanded:bg-gray-100 aria-expanded:text-gray-600",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-700 focus-visible:ring-red-700/50",
        link: "text-blue-800 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5",
        xs: "h-6 gap-1 rounded-[min(var(--button-radius-md),10px)] text-xs [[data-slot=button-group]_&]:rounded-[var(--button-radius-lg)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--button-radius-md),12px)] text-[0.8rem] [[data-slot=button-group]_&]:rounded-[var(--button-radius-lg)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5",
        icon: "h-8",
        "icon-xs":
          "h-6 rounded-[min(var(--button-radius-md),10px)] [[data-slot=button-group]_&]:rounded-[var(--button-radius-lg)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "h-7 rounded-[min(var(--button-radius-md),12px)] [[data-slot=button-group]_&]:rounded-[var(--button-radius-lg)]",
        "icon-lg": "h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  },
);

// Links e alertas também precisam da resolução de classes conflitantes.
export function buttonVariants(props?: Parameters<typeof buttonStyles>[0]) {
  return twMerge(buttonStyles(props));
}

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type VarianteBotao = "primary" | "secondary" | "outline" | "danger" | "ghost";

const variantes: Record<VarianteBotao, ButtonVariant> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  danger: "destructive",
  ghost: "ghost",
};

export function resolverVarianteBotao(variante: VarianteBotao = "primary"): ButtonVariant {
  return variantes[variante];
}

export function obterClassesBotao(variante: VarianteBotao = "primary") {
  return buttonVariants({ variant: resolverVarianteBotao(variante) });
}
