"use client";

import LoadingPage from "../LoadingPage";
import GerenciarFiltros from "./GerenciarFiltros";
import GerenciarInfoCards from "./GerenciarInfoCards";
import GerenciarListaVazia from "./GerenciarListaVazia";
import GerenciarUsuarioCard from "./GerenciarUsuarioCard";
import { useGerenciarUsuarios } from "./useGerenciarUsuarios";
import { filtrosAtivos } from "./usuarioUtils";
import type { FiltrosUsuario } from "./constants";

export default function Gerenciar() {
  const {
    currentUser,
    Edicao,
    userList,
    filteredUsers,
    loadingUserList,
    loadingRoleAction,
    filters,
    searchValue,
    setSearchValue,
    showInfoCards,
    toggleInfoCards,
    updateFilter,
    switchActiveUser,
    approveTeacher,
    approvePresenter,
    promoteToAdmin,
    promoteToSuperadmin,
    demoteUser,
    deleteUser,
  } = useGerenciarUsuarios();

  const handleFiltroChange = (tipo: keyof FiltrosUsuario, valor: string) => {
    updateFilter(tipo, valor);
  };

  const temFiltros = filtrosAtivos(filters, searchValue);
  const edicaoAtiva = !!Edicao?.isActive;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[#fafafa] p-6 max-md:gap-4 max-md:p-4 max-sm:p-3">
      <GerenciarFiltros
        busca={searchValue}
        onBuscaChange={setSearchValue}
        filtros={filters}
        userList={userList ?? []}
        onFiltroChange={handleFiltroChange}
        infoVisivel={showInfoCards}
        onToggleInfo={toggleInfoCards}
      />

      {showInfoCards && <GerenciarInfoCards />}

      <div className="w-full">
        {loadingUserList && (
          <div className="flex items-center justify-center rounded-xl border border-[#e9ecef] bg-white p-12 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <LoadingPage />
          </div>
        )}

        {!loadingUserList && filteredUsers.length > 0 && (
          <div className="flex w-full flex-col gap-4 max-md:gap-3">
            {filteredUsers.map((usuario) => (
              <GerenciarUsuarioCard
                key={usuario.id}
                usuario={usuario}
                usuarioAtual={currentUser}
                edicaoAtiva={edicaoAtiva}
                carregandoAcoes={loadingRoleAction}
                onAlternarAtivo={switchActiveUser}
                onExcluir={deleteUser}
                onAprovarProfessor={approveTeacher}
                onAprovarApresentador={approvePresenter}
                onPromoverAdmin={promoteToAdmin}
                onPromoverSuperadmin={promoteToSuperadmin}
                onRebaixar={demoteUser}
              />
            ))}
          </div>
        )}

        {!loadingUserList && filteredUsers.length === 0 && (
          <GerenciarListaVazia comFiltros={temFiltros} />
        )}
      </div>
    </div>
  );
}
