"use client";

import { usePathname } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

import { AuthContext } from "@/context/AuthProvider/authProvider";

import PerfilAdmin from "../Perfil/PerfilAdmin";
import PerfilApresentador from "../Perfil/PerfilApresentador";
import PerfilOuvinte from "../Perfil/PerfilOuvinte";
import PerfilProfessor from "../Perfil/PerfilProfessor";

import { useActiveEdition } from "@/hooks/useActiveEdition";
import { useEdicao } from "@/hooks/useEdicao";
import type { Edicao as EdicaoType } from "@/models/edicao";
import { cn } from "@/utils/cn";

type MenuItem = "inicio" | "programação do evento" | "contato" | "login";

const linkBase = "block w-fit text-center text-black no-underline hover:text-black";
const navItemBase = "cursor-pointer";

export default function Header() {
  const { user, signed } = useContext(AuthContext);
  const { listEdicao, edicoesList, getEdicaoByYear, Edicao } = useEdicao();
  const { setSelectEdition, selectEdition } = useActiveEdition();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setMenuOpen(false);
    if (pathname === "/home") {
      const section = document.getElementById(item);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getYearFromEdicao = (ed?: EdicaoType | null): string => {
    if (!ed) return "";
    if (ed.startDate) {
      const parsed = new Date(ed.startDate).getFullYear();
      if (!isNaN(parsed)) return String(parsed);
    }
    const match = ed.name?.match(/\b(20\d{2})\b/);
    return match ? match[1] : "";
  };

  const yearsOptions = useMemo(() => {
    const filtered = (edicoesList ?? [])
      .map((edicao) => {
        const rawYear = getYearFromEdicao(edicao);
        if (rawYear) {
          return {
            value: rawYear,
            label: `Edição ${rawYear}`,
            isActive: edicao.isActive,
          };
        }
        return { value: "", label: "", isActive: false };
      })
      .filter(
        (option, index, self) =>
          option.value &&
          self.findIndex((o) => o.value === option.value) === index,
      );

    return [...filtered].sort((a, b) => Number(b.value) - Number(a.value));
  }, [edicoesList]);

  function perfil() {
    if (!user) return null;

    if (user.level !== "Default")
      return <PerfilAdmin profile={user?.profile} role={user?.level} />;

    switch (user.profile) {
      case "Listener":
        return <PerfilOuvinte />;
      case "Professor":
        return <PerfilProfessor />;
      case "Presenter":
        return <PerfilApresentador />;

      default:
        return null;
    }
  }

  useEffect(() => {
    listEdicao();
  }, [listEdicao]);

  useEffect(() => {
    if (pathname === "/home") {
      const currentHash = typeof window !== "undefined" ? window.location.hash : "";
      if (currentHash === "#inicio") setSelectedItem("inicio");
      else if (currentHash === "#Programacao")
        setSelectedItem("programação do evento");
      else if (currentHash === "#Contato") setSelectedItem("contato");
      else setSelectedItem(null);
    } else if (pathname === "/login") {
      setSelectedItem("login");
    } else {
      setSelectedItem(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (
      selectEdition.year &&
      (!Edicao || getYearFromEdicao(Edicao) !== selectEdition.year)
    ) {
      getEdicaoByYear(selectEdition.year);
    }
  }, [selectEdition.year, Edicao, getEdicaoByYear]);

  useEffect(() => {
    if (edicoesList?.length && !selectEdition.year) {
      const edAtiva = edicoesList.find((v) => v.isActive) || edicoesList[0];
      const detectedYear = getYearFromEdicao(edAtiva);

      if (detectedYear) {
        setSelectEdition({
          year: detectedYear,
          isActive: !!edAtiva?.isActive,
        });
      }
    }
  }, [edicoesList, selectEdition.year, setSelectEdition]);

  return (
    <>
      <div className="h-20 md:h-24 w-full" aria-hidden="true" />
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm px-4 py-3 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 max-[1000px]:justify-center max-[500px]:gap-2">
          <div className="flex items-center gap-4 max-[500px]:w-full max-[500px]:justify-center">
            <Link className="flex items-center" href="/">
              <Image
                src="/assets/images/logo_PGCOMP.svg"
                alt="PGCOMP Logo"
                className="h-12 md:h-14 w-auto object-contain max-w-[280px] md:max-w-[340px]"
                width={353}
                height={75}
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 max-[500px]:w-full">
            {!!yearsOptions.length && (
              <select
                id="event-edition-select"
                className="max-w-48 rounded-md border border-line bg-white px-3 py-2 text-sm max-[500px]:w-full max-[500px]:max-w-none max-[500px]:text-xs"
                value={selectEdition.year}
                onChange={(ed: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectEdition({
                    year: ed.target.value,
                    isActive:
                      yearsOptions.find((v: { value: string; isActive: boolean }) => v.value == ed.target.value)
                        ?.isActive ?? false,
                  })
                }
              >
                {yearsOptions?.map((op: { value: string; label: string }, i: number) => (
                  <option id={`edicao-op${i}`} key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <section className="flex w-full gap-2 min-[1001px]:hidden">
            <button
              className="flex h-10 w-1/2 items-center justify-center rounded-lg border border-gray-400"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-controls="navbarSupportedContent"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              {/* Ícone de navegação mobile moderno do lucide-react */}
              <Home className="h-5 w-5 text-gray-700" aria-hidden="true" />
            </button>
            <div className="flex h-10 w-1/2 items-center justify-center rounded-lg border border-gray-400">
              {signed ? (
                <div className="flex h-full flex-col items-center justify-center text-[10px] text-black">
                  {perfil()}
                </div>
              ) : (
                <Link
                  className={cn(linkBase, "flex h-full w-full items-center justify-center text-base")}
                  aria-current="page"
                  href="/login"
                >
                  Login
                </Link>
              )}
            </div>
          </section>

          <div
            className={cn(
              "mr-5 transition-all duration-300 ease-in-out max-[1000px]:w-full",
              menuOpen ? "block" : "hidden min-[1001px]:block",
            )}
            id="navbarSupportedContent"
          >
            <ul className="flex list-none flex-row flex-wrap items-center gap-3.5 font-normal max-[1000px]:justify-center">
              <div
                className={cn(
                  navItemBase,
                  selectedItem === "inicio" && "font-bold",
                )}
                onClick={() => handleItemClick("inicio")}
              >
                <Link className={linkBase} href="/home">
                  Início
                </Link>
              </div>

              <div
                className={cn(
                  navItemBase,
                  selectedItem === "programação do evento" && "font-bold",
                )}
                onClick={() => handleItemClick("programação do evento")}
              >
                <Link className={cn(linkBase, "w-[188px]")} href="/home#Programacao">
                  Programação
                </Link>
              </div>

              {!signed && (
                <li>
                  <Link
                    className={cn(linkBase, "active")}
                    aria-current="page"
                    href="/cadastro"
                  >
                    Cadastro
                  </Link>
                </li>
              )}

              <div>
                <Link className={linkBase} href="/orientacoes">
                  Orientações
                </Link>
              </div>

              <div
                className={cn(
                  navItemBase,
                  selectedItem === "contato" && "font-bold",
                )}
                onClick={() => handleItemClick("contato")}
              >
                <Link className={linkBase} href="/home#Contato">
                  Contato
                </Link>
              </div>

              <li className="max-[1000px]:hidden">
                {signed ? (
                  <div className="flex flex-col items-center justify-center text-[10px] text-black">
                    Olá, {user?.name.split(" ")[0]}!{perfil()}
                  </div>
                ) : (
                  <Link
                    className={cn(linkBase, "active")}
                    aria-current="page"
                    href="/login"
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
