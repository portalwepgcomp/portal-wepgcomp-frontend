import { cn } from "@/utils/cn";
import { badgeBase } from "./constants";

export default function GerenciarUsuarioBadges({ user }: { user: User }) {
  const badges: React.ReactNode[] = [];

  if (user.isSuperadmin) {
    badges.push(
      <span
        key="superadmin"
        className={cn(
          badgeBase,
          "border-[#ffcc02] bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] text-[#e65100]",
        )}
      >
        Superadmin
      </span>,
    );
  } else if (user.isAdmin) {
    badges.push(
      <span
        key="admin"
        className={cn(
          badgeBase,
          "border-[#2196f3] bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] text-[#1565c0]",
        )}
      >
        Admin
      </span>,
    );
  }

  if (user.profile === "Professor") {
    badges.push(
      <span
        key="teacher"
        className={cn(
          badgeBase,
          user.isTeacherActive
            ? "border-[#4caf50] bg-gradient-to-br from-[#e8f5e8] to-[#c8e6c9] text-[#2e7d32]"
            : "border-[#ffcc02] bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] text-[#e65100]",
        )}
      >
        {user.isTeacherActive ? "Professor Aprovado" : "Professor Pendente"}
      </span>,
    );
  }

  if (user.profile === "Presenter") {
    badges.push(
      <span
        key="presenter"
        className={cn(
          badgeBase,
          "border-[#00bcd4] bg-gradient-to-br from-[#e1f5fe] to-[#b3e5fc] text-[#0277bd]",
        )}
      >
        Apresentador
        {!user.isPresenterActive && " (pendente)"}
      </span>,
    );
  }

  if (user.profile === "Listener") {
    badges.push(
      <span
        key="listener"
        className={cn(
          badgeBase,
          "border-[#9e9e9e] bg-gradient-to-br from-[#f5f5f5] to-[#eeeeee] text-[#424242]",
        )}
      >
        Ouvinte
      </span>,
    );
  }

  return <div className="flex flex-wrap gap-2">{badges}</div>;
}
