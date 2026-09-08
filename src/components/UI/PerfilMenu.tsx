"use client";

import { cn } from "@/utils/cn";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";

const itemClass =
  "block w-full px-4 py-2 text-left text-sm font-light text-inherit no-underline transition hover:bg-[#019A34] hover:text-white";

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
        className="flex items-center justify-center border-0 bg-transparent p-0 text-foreground transition hover:opacity-80 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menu do perfil"
      >
        <Menu className="h-7 w-7" aria-hidden="true" />
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
        <Link href={href} className={itemClass} onClick={onClick}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" className={itemClass} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}
