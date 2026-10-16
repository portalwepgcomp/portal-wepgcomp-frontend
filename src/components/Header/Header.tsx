"use client";

import { usePathname } from "next/navigation";
import { useContext, useEffect, useMemo, useState, useRef } from "react";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/UI/Button";
import { obterClassesBotao } from "@/lib/estilosBotao";
import { Home } from "lucide-react";

import { AuthContext } from "@/context/AuthProvider/authProvider";

import PerfilAdmin from "../Perfil/PerfilAdmin";
import PerfilApresentador from "../Perfil/PerfilApresentador";
import PerfilOuvinte from "../Perfil/PerfilOuvinte";
import PerfilProfessor from "../Perfil/PerfilProfessor";

import { getEditionYear, useActiveEdition } from "@/hooks/useActiveEdition";
import { useEdicao } from "@/hooks/useEdicao";
import type { Edicao as EdicaoType } from "@/models/edicao";
import { cn } from "@/utils/cn";

type MenuItem = "inicio" | "programação do evento" | "contato" | "login";

const linkBase =
  "block w-fit text-center text-black no-underline hover:text-black max-[1000px]:w-full max-[1000px]:rounded-md max-[1000px]:px-4 max-[1000px]:py-3 max-[1000px]:hover:bg-muted-light/60";
const navItemBase = "cursor-pointer max-[1000px]:w-full";

export default function Header() {
  const menuRef = useRef<HTMLElement>(null);
  const { user, signed } = useContext(AuthContext);
  const { edicoesList, Edicao } = useEdicao();
  const {
    setSelectEdition,
    selectEdition,
    loadingActiveEdition,
    selectionError,
  } = useActiveEdition();

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

  const editionsOptions = useMemo(() => {
    const editions: EdicaoType[] = [...(edicoesList ?? [])];
    if (Edicao?.id && !editions.some((edition) => edition.id === Edicao.id))
      editions.push(Edicao);
    return editions.sort(
      (a, b) =>
        (b.startDate ?? "").localeCompare(a.startDate ?? "") ||
        a.id.localeCompare(b.id),
    );
  }, [edicoesList, Edicao]);

  const editionLabel = (edition: EdicaoType) => {
    const date = edition.startDate ? new Date(edition.startDate) : null;
    const dateLabel =
      date && !Number.isNaN(date.getTime())
        ? ` — ${date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`
        : "";
    const repeated =
      editionsOptions.filter(
        (value) =>
          value.name === edition.name && value.startDate === edition.startDate,
      ).length > 1;
    return `${edition.name || `Edição ${getEditionYear(edition)}`}${dateLabel}${edition.isActive ? " (ativa)" : ""}${repeated ? ` — ${edition.id}` : ""}`;
  };

  function perfil(compact = false) {
    if (!user) return null;

    const name = user.name;
    if (user.level !== "Default") {
      return (
        <PerfilAdmin
          profile={user.profile}
          role={user.level}
          userName={name}
          compact={compact}
        />
      );
    }

    switch (user.profile) {
      case "Listener":
        return <PerfilOuvinte userName={name} compact={compact} />;
      case "Professor":
        return <PerfilProfessor userName={name} compact={compact} />;
      case "Presenter":
        return <PerfilApresentador userName={name} compact={compact} />;
      default:
        return null;
    }
  }

  useEffect(() => {
    if (pathname === "/home") {
      const currentHash =
        typeof window !== "undefined" ? window.location.hash : "";
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
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav
        ref={menuRef}
        className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm md:px-8"
      >
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
            {!!editionsOptions.length && (
              <select
                id="event-edition-select"
                className="max-w-48 rounded-md border border-line bg-white px-3 py-2 text-sm max-[500px]:w-full max-[500px]:max-w-none max-[500px]:text-xs"
                aria-label="Selecionar edição do evento"
                value={selectEdition.id}
                disabled={loadingActiveEdition}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const edition = editionsOptions.find(
                    (value) => value.id === event.target.value,
                  );
                  if (edition)
                    setSelectEdition({
                      id: edition.id,
                      name: edition.name,
                      year: getEditionYear(edition),
                      isActive: edition.isActive,
                    });
                }}
              >
                {!selectEdition.id && (
                  <option value="">Selecione uma edição</option>
                )}
                {editionsOptions.map((edition) => (
                  <option key={edition.id} value={edition.id}>
                    {editionLabel(edition)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectionError && (
            <p role="alert" className="text-sm text-error">
              {selectionError}
            </p>
          )}

          <section className="flex w-full flex-col gap-2 min-[501px]:flex-row min-[1001px]:hidden">
            <Button
              size="lg"
              variante="secondary"
              className="w-full gap-2 min-[501px]:w-1/2"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-controls="navbarSupportedContent"
              aria-expanded={menuOpen}
              aria-label="Alternar navegação"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              <span>Início</span>
            </Button>
            <div className="flex w-full min-w-0 items-center justify-center min-[501px]:w-1/2">
              {signed ? (
                <div className="flex h-full w-full min-w-0 items-center justify-center">
                  {perfil(true)}
                </div>
              ) : (
                <Link
                  className={cn(obterClassesBotao("outline"), "w-full")}
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
              "mr-5 transition-all duration-300 ease-in-out max-[1279px]:mr-0 max-[1279px]:w-full",
              menuOpen ? "block" : "hidden min-[1001px]:block",
            )}
            id="navbarSupportedContent"
          >
            <ul className="flex list-none flex-row flex-wrap items-center gap-3.5 font-normal max-[1000px]:flex-col max-[1000px]:items-stretch max-[1000px]:gap-1">
              <li
                className={cn(
                  navItemBase,
                  selectedItem === "inicio" && "font-bold",
                )}
                onClick={() => handleItemClick("inicio")}
              >
                <Link className={linkBase} href="/home">
                  Início
                </Link>
              </li>

              <li
                className={cn(
                  navItemBase,
                  selectedItem === "programação do evento" && "font-bold",
                )}
                onClick={() => handleItemClick("programação do evento")}
              >
                <Link
                  className={cn(linkBase, "w-[188px] max-[1000px]:w-full")}
                  href="/home#Programacao"
                >
                  Programação
                </Link>
              </li>

              {!signed && (
                <li>
                  <Link
                    className={cn(
                      linkBase,
                      "active",
                      pathname === "/cadastro" && "font-bold",
                    )}
                    aria-current="page"
                    href="/cadastro"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cadastro
                  </Link>
                </li>
              )}

              <li className={navItemBase}>
                <Link
                  className={cn(
                    linkBase,
                    pathname === "/orientacoes" && "font-bold",
                  )}
                  href="/orientacoes"
                  onClick={() => setMenuOpen(false)}
                >
                  Orientações
                </Link>
              </li>

              <li
                className={cn(
                  navItemBase,
                  selectedItem === "contato" && "font-bold",
                )}
                onClick={() => handleItemClick("contato")}
              >
                <Link className={linkBase} href="/home#Contato">
                  Contato
                </Link>
              </li>

              <li className="max-[1279px]:ml-auto max-[1000px]:hidden">
                {signed ? (
                  perfil(false)
                ) : (
                  <Link
                    className={cn(
                      linkBase,
                      "active",
                      pathname === "/login" && "font-bold",
                    )}
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
