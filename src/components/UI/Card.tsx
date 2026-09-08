import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  icon,
  children,
  className,
}: Readonly<CardProps>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-8 shadow-md transition hover:shadow-lg",
        className,
      )}
    >
      {(title || icon) && (
        <div className="mb-6 flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title && (
            <h3 className="m-0 text-xl font-semibold text-foreground">
              {title}
            </h3>
          )}
        </div>
      )}
      {subtitle && <p className="mb-6 text-sm text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}
