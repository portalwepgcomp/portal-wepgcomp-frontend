import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useSweetAlert } from "@/hooks/useAlert";
import { UpdateUserRequest } from "@/models/update-user";
import {
  User,
  GetUserParams,
  RegisterUserParams,
  CreateProfessorByAdminParams,
  ResetPasswordSendEmailParams,
  ResetPasswordParams,
} from "@/models/user";
import { unwrapPaginatedList } from "@/types/api";
import { userApi } from "@/services/user";
import { registrarErro } from "@/utils/logError";
import { getErrorMessage } from "@/utils/error";

interface UserProps {
  children: ReactNode;
}

interface UserProviderData {
  loadingCreateUser: boolean;
  loadingCreateProfessor: boolean;
  loadingSendEmail: boolean;
  loadingResetPassword: boolean;
  loadingUserList: boolean;
  loadingAdvisors: boolean;
  loadingAdmins: boolean;
  loadingSwitchActive: boolean;
  loadingRoleAction: boolean;
  user: User | null;
  userList: User[];
  advisors: User[];
  admins: User[];
  getUsers: (params: GetUserParams) => Promise<void>;
  registerUser: (body: RegisterUserParams) => Promise<void>;
  createProfessorByAdmin: (
    body: CreateProfessorByAdminParams,
  ) => Promise<User | undefined>;
  resetPasswordSendEmail: (body: ResetPasswordSendEmailParams) => Promise<void>;
  resetPassword: (body: ResetPasswordParams) => Promise<void>;
  getAdvisors: () => Promise<void>;
  getAdmins: () => Promise<void>;
  switchActiveUser: (userId: string, activate: boolean) => Promise<void>;
  approveTeacher: (userId: string) => Promise<void>;
  approvePresenter: (userId: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  demoteUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (
    email: string,
    updateUserRequest: UpdateUserRequest,
  ) => Promise<boolean | void>;
  findUserById: (userId: string) => Promise<User | undefined>;
}

export const UserContext = createContext<UserProviderData>(
  {} as UserProviderData,
);

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }: UserProps) => {
  const [loadingCreateUser, setLoadingCreateUser] = useState<boolean>(false);
  const [loadingCreateProfessor, setLoadingCreateProfessor] =
    useState<boolean>(false);
  const [loadingUserList, setLoadingUserList] = useState<boolean>(false);
  const [loadingSendEmail, setLoadingSendEmail] = useState<boolean>(false);
  const [loadingResetPassword, setLoadingResetPassword] =
    useState<boolean>(false);
  const [loadingAdvisors, setLoadingAdvisors] = useState<boolean>(false);
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(false);
  const [loadingSwitchActive, setLoadingSwitchActive] =
    useState<boolean>(false);
  const [loadingRoleAction, setLoadingRoleAction] = useState<boolean>(false);
  const [_loadingUser, setLoadingUser] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const userListRef = useRef<User[]>([]);
  userListRef.current = userList;
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const { user: authUser } = useContext(AuthContext);

  const { showAlert } = useSweetAlert();
  const router = useRouter();

  const getUsers = useCallback(
    async (params: GetUserParams) => {
      setLoadingUserList(true);

      if (authUser) {
        try {
          const response = await userApi.getUsers(params);
          setUserList(unwrapPaginatedList(response) as User[]);
        } catch (err: unknown) {
          setUserList([]);
          showAlert({
            icon: "error",
            title: "Erro ao listar usuários",
            text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
            confirmButtonText: "Retornar",
          });
        } finally {
          setLoadingUserList(false);
        }
      } else {
        setLoadingUserList(false);
      }
    },
    [authUser, showAlert],
  );

  const registerUser = useCallback(
    async (body: RegisterUserParams) => {
      setLoadingCreateUser(true);

      try {
        const response = await userApi.registerUser(body);
        setUser(response);

        showAlert({
          icon: "success",
          title: "Cadastro realizado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        router.push("/login");
      } catch (err: unknown) {
        setUser(null);

        showAlert({
          icon: "error",
          title: "Erro ao cadastrar usuário",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingCreateUser(false);
      }
    },
    [router, showAlert],
  );

  const createProfessorByAdmin = useCallback(
    async (body: CreateProfessorByAdminParams) => {
      setLoadingCreateProfessor(true);

      try {
        const response = await userApi.createProfessorByAdmin(body);

        showAlert({
          icon: "success",
          title: "Professor cadastrado com sucesso!",
          text: "O professor foi cadastrado e receberá um email com as credenciais de acesso.",
          timer: 3000,
          showConfirmButton: false,
        });

        getUsers({});

        return response;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao cadastrar professor",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
        throw err;
      } finally {
        setLoadingCreateProfessor(false);
      }
    },
    [getUsers, showAlert],
  );

  const resetPasswordSendEmail = useCallback(
    async (body: ResetPasswordSendEmailParams) => {
      setLoadingSendEmail(true);

      try {
        const response = await userApi.resetPasswordSendEmail(body);
        setUser(response);

        showAlert({
          icon: "success",
          title: "E-mail enviado com sucesso!",
          text: "Confira o e-mail cadastrado para redefinir a senha.",
          timer: 3000,
          showConfirmButton: false,
        });

        router.push("/login");
      } catch (err: unknown) {
        setUser(null);

        showAlert({
          icon: "error",
          title: "Erro ao enviar e-mail",
          text: getErrorMessage(err, "Ocorreu um erro ao enviar o e-mail."),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingSendEmail(false);
      }
    },
    [router, showAlert],
  );

  const resetPassword = useCallback(
    async (body: ResetPasswordParams) => {
      setLoadingResetPassword(true);

      try {
        const response = await userApi.resetPassword(body);
        setUser(response);

        showAlert({
          icon: "success",
          title: "Senha alterada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        router.push("/login");
      } catch (err: unknown) {
        setUser(null);

        showAlert({
          icon: "error",
          title: "Erro ao alterar senha",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar alterar sua senha. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingResetPassword(false);
      }
    },
    [router, showAlert],
  );

  const switchActiveUser = useCallback(
    async (userId: string, activate: boolean) => {
      setLoadingSwitchActive(true);

      try {
        await userApi.switchActiveUser(userId, activate);
        showAlert({
          icon: "success",
          title: "Status de ativação alterado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao trocar status",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar alterar status. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingSwitchActive(false);
      }
    },
    [getUsers, showAlert],
  );

  const getAdvisors = useCallback(async () => {
    setLoadingAdvisors(true);

    try {
      const response = await userApi.getAdvisors();
      setAdvisors(response);
    } catch (err: unknown) {
      registrarErro("Erro na requisição de usuários", err);
      setAdvisors([]);

      showAlert({
        icon: "error",
        title: "Erro ao buscar orientadores",
        text: getErrorMessage(err, "Ocorreu um erro ao buscar orientadores."),
        confirmButtonText: "Retornar",
      });
    } finally {
      setLoadingAdvisors(false);
    }
  }, [showAlert]);

  const getAdmins = useCallback(async () => {
    setLoadingAdmins(true);

    try {
      const response = await userApi.getAdmins();
      setAdmins(response);
    } catch (err: unknown) {
      registrarErro("Erro na requisição de usuários", err);
      setAdmins([]);

      showAlert({
        icon: "error",
        title: "Erro ao buscar administradores",
        text: getErrorMessage(
          err,
          "Ocorreu um erro ao buscar administradores.",
        ),
        confirmButtonText: "Retornar",
      });
    } finally {
      setLoadingAdmins(false);
    }
  }, [showAlert]);

  const approveTeacher = useCallback(
    async (userId: string) => {
      setLoadingRoleAction(true);

      try {
        await userApi.approveTeacher(userId);
        showAlert({
          icon: "success",
          title: "Professor aprovado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao aprovar professor",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar aprovar o professor. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const approvePresenter = useCallback(
    async (userId: string) => {
      setLoadingRoleAction(true);

      try {
        await userApi.approvePresenter(userId);

        // Optimistic update
        setUserList((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, isPresenterActive: true } : u,
          ),
        );

        showAlert({
          icon: "success",
          title: "Apresentador aprovado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        await getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao aprovar apresentador",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar aprovar o apresentador. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const promoteToAdmin = useCallback(
    async (userId: string) => {
      setLoadingRoleAction(true);

      try {
        const targetUser = userListRef.current.find((u) => u.id === userId);
        if (!targetUser) {
          throw new Error("Usuário não encontrado");
        }

        await userApi.updateUser(targetUser.email, { level: "Admin" });
        showAlert({
          icon: "success",
          title: "Usuário promovido a Administrador!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao promover usuário",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar promover o usuário. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const demoteUser = useCallback(
    async (userId: string) => {
      setLoadingRoleAction(true);

      try {
        const targetUser = userListRef.current.find((u) => u.id === userId);
        if (!targetUser) {
          throw new Error("Usuário não encontrado");
        }

        await userApi.updateUser(targetUser.email, { level: "Default" });
        showAlert({
          icon: "success",
          title: "Usuário rebaixado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao rebaixar usuário",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar rebaixar o usuário. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      setLoadingRoleAction(true);

      try {
        await userApi.deleteUser(userId);
        showAlert({
          icon: "success",
          title: "Usuário excluído com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao excluir usuário",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar excluir o usuário. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const updateUser = useCallback(
    async (email: string, updateUserRequest: UpdateUserRequest) => {
      try {
        await userApi.updateUser(email, updateUserRequest);
        showAlert({
          icon: "success",
          title: "Usuário editado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        getUsers({});
        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao editar usuário",
          text: getErrorMessage(
            err,
            "Ocorreu um erro ao tentar editar o usuário. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingRoleAction(false);
      }
    },
    [getUsers, showAlert],
  );

  const findUserById = useCallback(
    async (id: string) => {
      setLoadingUser(true);
      try {
        const data = await userApi.findUserById(id);
        setUser(data);
        return data;
      } catch (err: unknown) {
        setUser(null);
        showAlert({
          icon: "error",
          title: "Erro ao encontrar o usuário",
          text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
          confirmButtonText: "Retornar",
        });
        return undefined;
      } finally {
        setLoadingUser(false);
      }
    },
    [showAlert],
  );

  const contextValue = useMemo(
    () => ({
      loadingCreateUser,
      loadingCreateProfessor,
      loadingSendEmail,
      loadingResetPassword,
      loadingUserList,
      loadingAdvisors,
      loadingAdmins,
      loadingSwitchActive,
      loadingRoleAction,
      user,
      userList,
      advisors,
      admins,
      getUsers,
      registerUser,
      createProfessorByAdmin,
      resetPasswordSendEmail,
      resetPassword,
      getAdvisors,
      getAdmins,
      switchActiveUser,
      approveTeacher,
      approvePresenter,
      promoteToAdmin,
      demoteUser,
      deleteUser,
      updateUser,
      findUserById,
    }),
    [
      loadingCreateUser,
      loadingCreateProfessor,
      loadingSendEmail,
      loadingResetPassword,
      loadingUserList,
      loadingAdvisors,
      loadingAdmins,
      loadingSwitchActive,
      loadingRoleAction,
      user,
      userList,
      advisors,
      admins,
      getUsers,
      registerUser,
      createProfessorByAdmin,
      resetPasswordSendEmail,
      resetPassword,
      getAdvisors,
      getAdmins,
      switchActiveUser,
      approveTeacher,
      approvePresenter,
      promoteToAdmin,
      demoteUser,
      deleteUser,
      updateUser,
      findUserById,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
