import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { User } from "@/models/user";

interface FilterOption {
  value: string;
  label: string;
  countKey?: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  userList: User[];
  onChange: (value: string) => void;
  className?: string;
}

type CountFunction = (user: User) => boolean;

export default function FilterSelect({
  label,
  value,
  options,
  userList,
  onChange,
  className = "",
}: FilterSelectProps) {
  const countFunctions: Record<string, CountFunction> = useMemo(
    () => ({
      ativo: (user: User) =>
        user.isActive &&
        (user.profile !== "Professor" || user.isTeacherActive) &&
        (user.profile !== "Presenter" || user.isPresenterActive),
      ativo_pendente: (user: User) =>
        (user.profile === "Professor" &&
          user.isActive &&
          !user.isTeacherActive) ||
        (user.profile === "Presenter" &&
          user.isActive &&
          !user.isPresenterActive),
      inativo: (user: User) => !user.isActive,
      superadmin: (user: User) => user.isSuperadmin,
      admin: (user: User) => user.isAdmin && !user.isSuperadmin,
      normal: (user: User) => !user.isAdmin && !user.isSuperadmin,
      apresentador: (user: User) => user.profile === "Presenter",
      professor: (user: User) => user.profile === "Professor",
      ouvinte: (user: User) => user.profile === "Listener",
    }),
    [],
  );

  const getCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    options.forEach((option) => {
      if (option.countKey && countFunctions[option.countKey]) {
        counts[option.countKey] = (userList || []).filter(
          countFunctions[option.countKey],
        ).length;
      }
    });

    return counts;
  }, [userList, options, countFunctions]);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 max-md:w-full max-md:flex-none",
        className,
      )}
    >
      <label className="text-sm font-semibold uppercase tracking-wide text-[#495057]">
        {label}
      </label>
      <select
        className={cn(
          "cursor-pointer rounded-lg border-2 border-[#e9ecef] bg-white px-4 py-2",
          "text-sm text-[#495057] transition-[border-color] duration-200",
          "focus:border-[#007bff] focus:outline-none focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)]",
        )}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.countKey && ` (${getCounts[option.countKey] || 0})`}
          </option>
        ))}
      </select>
    </div>
  );
}
