"use client";

import { classeItemMenu } from "@/lib/estilosMenu";
import { cn } from "@/utils/cn";
import type { ProfileType, RoleType } from "@/models/user";
import {
  firstName,
  isAdminLevel,
  profileLabel,
  userInitials,
} from "@/components/Perfil/perfilLabels";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
interface PerfilMenuProps {
  children: ReactNode;
  userName: string;
  profile: ProfileType;
  level: RoleType;
  className?: string;
  compact?: boolean;
}

export function PerfilMenu({
  children,
  userName,
  profile,
  level,
  className,
  compact = false,
}: PerfilMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const admin = isAdminLevel(level);
  const initials = userInitials(userName);
  const shortName = firstName(userName);

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
    <div className={cn("relative min-w-[13rem]", className)} ref={ref}>
      <button
        type="button"
        className={cn(
          "relative z-50 flex w-full items-center gap-2 border border-line bg-white px-2.5 py-1.5 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          open
            ? "rounded-t-lg rounded-b-none border-b-0 bg-muted-light/40"
            : "rounded-lg hover:bg-muted-light/60",
          compact && "gap-1.5 px-2 py-1",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu da conta: ${userName}`}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
          aria-hidden
        >
          {initials}
        </span>
        {compact ? (
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            <ProfileBadge label={profileLabel(profile)} />
            {admin && <ProfileBadge label="Admin" variant="admin" />}
          </span>
        ) : (
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold leading-tight text-foreground">
              {shortName}
            </span>
            <span className="flex flex-wrap gap-1">
              <ProfileBadge label={profileLabel(profile)} />
              {admin && <ProfileBadge label="Admin" variant="admin" />}
            </span>
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-40 w-full min-w-[13rem] list-none overflow-hidden rounded-b-lg border border-t-0 border-line bg-white p-0 pb-1 shadow-sm"
        >
          <li className="px-3 py-2">
            <p className="truncate text-xs text-muted">{userName}</p>
          </li>
          <li aria-hidden className="mx-3 border-t border-line" />
          {children}
        </ul>
      )}
    </div>
  );
}

function ProfileBadge({
  label,
  variant = "profile",
}: {
  label: string;
  variant?: "profile" | "admin";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none",
        variant === "admin"
          ? "bg-amber-100 text-amber-900"
          : "bg-sky-100 text-sky-900",
      )}
    >
      {label}
    </span>
  );
}

interface PerfilMenuSectionProps {
  title: string;
  children: ReactNode;
}

export function PerfilMenuSection({ title, children }: PerfilMenuSectionProps) {
  return (
    <li className="list-none">
      <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="list-none p-0">{children}</ul>
    </li>
  );
}

interface PerfilMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

export function PerfilMenuItem({
  children,
  onClick,
  href,
  danger = false,
}: PerfilMenuItemProps) {
  const className = cn(
    classeItemMenu,
    danger && "text-error hover:bg-error-light hover:text-error",
  );

  if (href) {
    return (
      <li role="none">
        <Link href={href} className={className} role="menuitem" onClick={onClick}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li role="none">
      <button type="button" className={className} role="menuitem" onClick={onClick}>
        {children}
      </button>
    </li>
  );
}
