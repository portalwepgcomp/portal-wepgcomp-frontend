"use client";

import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { AuthContext } from "@/context/AuthProvider/authProvider";

import PerfilAdmin from "../Perfil/PerfilAdmin";
import PerfilApresentador from "../Perfil/PerfilApresentador";
import PerfilOuvinte from "../Perfil/PerfilOuvinte";
import PerfilProfessor from "../Perfil/PerfilProfessor";

import { useActiveEdition } from "@/hooks/useActiveEdition";
import { useEdicao } from "@/hooks/useEdicao";
import { cn } from "@/utils/cn";

type MenuItem = "inicio" | "programação do evento" | "contato" | "login";

const linkBase = "block w-fit text-center text-black no-underline hover:text-black";
const navItemBase = "cursor-pointer";

export default function Header() {
  const { user, signed } = useContext(AuthContext);
  const { listEdicao, edicoesList, getEdicaoByYear } = useEdicao();
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

  const yearsOptions = edicoesList
    ?.map((ed) => {
      if (ed.startDate) {
        const fullYear = new Date(ed?.startDate).getFullYear();

        return {
          value: fullYear,
          label: `Edição ${fullYear}`,
          isActive: ed.isActive,
        };
      }

      return { value: "", label: "", isActive: false };
    })
    ?.filter(
      (option, index, self) =>
        option.value &&
        self.findIndex((o) => o.value === option.value) === index,
    )
    ?.toSorted((a, b) => Number(b.value) - Number(a.value));

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
    const currentPath = pathname;
    const currentHash = window.location.hash;
    listEdicao();

    if (currentPath === "/home") {
      if (currentHash === "#inicio") setSelectedItem("inicio");
      else if (currentHash === "#Programacao")
        setSelectedItem("programação do evento");
      else if (currentHash === "#Contato") setSelectedItem("contato");
      else setSelectedItem(null);
    } else if (currentPath === "/login") {
      setSelectedItem("login");
    } else {
      setSelectedItem(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (selectEdition.year) {
      getEdicaoByYear(selectEdition.year);
    }
  }, [selectEdition.year]);

  useEffect(() => {
    if (edicoesList?.length && !selectEdition.year) {
      const edAtiva = edicoesList.find((v) => v.isActive);

      if (edAtiva?.startDate) {
        setSelectEdition({
          year: String(new Date(edAtiva.startDate).getFullYear()),
          isActive: true,
        });
      }
    }
  }, [edicoesList, selectEdition.year, setSelectEdition]);

  return (
    <>
      <div className="flex min-h-[126px] items-center max-[1000px]:min-h-[152px]">
        <span />
      </div>
      <nav className="fixed z-[1000] w-full bg-white px-2 py-6 max-[1000px]:p-1.5">
        <div className="flex animate-[fadeInDown_1.5s_ease] flex-wrap items-center justify-between gap-4 max-[1000px]:justify-center max-[500px]:gap-2">
          <div className="flex items-center gap-4 max-[500px]:w-full">
            <Link className="relative mx-auto" href="/">
              <Image
                src="/assets/images/logo_PGCOMP.svg"
                alt="PGCOMP Logo"
                className="h-auto w-full max-w-[250px]"
                width={300}
                height={100}
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 max-[500px]:w-full">
            {!!yearsOptions.length && (
              <select
                id="event-edition-select"
                className="max-w-48 rounded-md border border-line bg-white px-3 py-2 text-sm max-[500px]:w-full max-[500px]:max-w-none max-[500px]:text-xs"
                value={selectEdition.year}
                onChange={(ed) =>
                  setSelectEdition({
                    year: ed.target.value,
                    isActive:
                      yearsOptions.find((v) => v.value == ed.target.value)
                        ?.isActive ?? false,
                  })
                }
              >
                {yearsOptions?.map((op, i) => (
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
              <i className="bi bi-house" />
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
