"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { useUsers } from "@/hooks/useUsers";
import { filtrosIniciais, type FiltrosUsuario } from "./constants";
import { filtrarUsuarios } from "./usuarioUtils";

export function useGerenciarUsuarios() {
  const { user: currentUser } = useContext(AuthContext);
  const { Edicao } = useEdicao();
  const usersApi = useUsers();

  const [filters, setFilters] = useState<FiltrosUsuario>(filtrosIniciais);
  const [searchValue, setSearchValue] = useState("");
  const [showInfoCards, setShowInfoCards] = useState(false);

  const filteredUsers = useMemo(
    () => filtrarUsuarios(usersApi.userList, searchValue, filters),
    [usersApi.userList, searchValue, filters],
  );

  const updateFilter = useCallback(
    (filterType: keyof FiltrosUsuario, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [filterType]: prev[filterType] === value ? "" : value,
      }));
    },
    [],
  );

  const toggleInfoCards = useCallback(() => {
    setShowInfoCards((v) => !v);
  }, []);

  useEffect(() => {
    usersApi.getUsers({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentUser,
    Edicao,
    ...usersApi,
    filters,
    searchValue,
    setSearchValue,
    showInfoCards,
    toggleInfoCards,
    updateFilter,
    filteredUsers,
    recarregarUsuarios: () => usersApi.getUsers({}),
  };
}
