"use client";

import { classeItemMenu } from "@/lib/estilosMenu";
import { cn } from "@/utils/cn";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";

interface PerfilMenuProps {
  children: ReactNode;
  className?: string;
}

/**
 * Menu dropdown de opções do usuário logado (Perfil, Sair, etc.).
 * Utiliza o ícone moderno do lucide-react e fecha automaticamente ao clicar fora.
 */
export function PerfilMenu({ children, className }: PerfilMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center border-0 bg-transparent text-foreground hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menu do perfil"
      >
        <Menu className="size-7" aria-hidden="true" />
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-1 min-w-[12rem] list-none rounded-md border-[3px] border-muted-light bg-white p-0 py-1 shadow-lg">
          {children}
        </ul>
      )}
    </div>
  );
}

interface PerfilMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}

export function PerfilMenuItem({
  children,
  onClick,
  href,
}: PerfilMenuItemProps) {
  if (href) {
    return (
      <li>
        <Link href={href} className={classeItemMenu} onClick={onClick}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" className={classeItemMenu} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}
