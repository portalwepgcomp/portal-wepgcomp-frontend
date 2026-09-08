import { cn } from "@/utils/cn";

interface SpinnerProps {
  className?: string;
  colorClassName?: string;
}

export default function Spinner({
  className,
  colorClassName = "text-primary",
}: Readonly<SpinnerProps>) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent align-[-0.125em]",
        colorClassName,
        className,
      )}
    />
  );
}
