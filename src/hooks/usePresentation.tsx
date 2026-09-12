import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { presentationApi } from "@/services/presentation";
import {
  Presentation,
  PresentationBookmark,
  PresentationBookmarkRegister,
} from "@/models/presentation";

interface PresentationProps {
  children: ReactNode;
}

interface PresentationProviderData {
  presentationList: Presentation[];
  presentationBookmark: PresentationBookmark;
  getPresentationAll: (eventEditionId: string) => Promise<void>;
  getPresentationBookmark: (
    presentationBookmark: PresentationBookmarkRegister
  ) => Promise<PresentationBookmark>;
  postPresentationBookmark: (
    presentationBookmark: PresentationBookmarkRegister
  ) => Promise<void>;
  deletePresentationBookmark: (
    presentationBookmark: PresentationBookmarkRegister
  ) => Promise<void>;
  getPresentationById: (id: string) => Promise<Presentation>;
}

export const PresentationContext = createContext<PresentationProviderData>(
  {} as PresentationProviderData
);

export const usePresentation = () => useContext(PresentationContext);

export const PresentationProvider = ({ children }: PresentationProps) => {
  const [presentationList, setpresentationList] = useState<Presentation[]>([]);
  const [presentationBookmark, setpresentationBookmark] =
    useState<PresentationBookmark>({ bookmarked: false });
  const queryClient = useQueryClient();

  const getPresentationById = useCallback(
    async (id: string): Promise<Presentation> => {
      return presentationApi.getPresentationById(id);
    },
    []
  );

  const getPresentationAll = useCallback(async (eventEditionId: string) => {
    if (!eventEditionId) {
      setpresentationList([]);
      return;
    }
    try {
      const response = await presentationApi.getPresentations(eventEditionId);
      setpresentationList(response || []);
    } catch {
      setpresentationList([]);
    }
  }, []);

  const getPresentationBookmark = useCallback(
    async (presentationBookmark: PresentationBookmarkRegister) => {
      try {
        const response =
          await presentationApi.getPresentationBookmark(presentationBookmark);
        setpresentationBookmark(response);
        return response;
      } catch {
        const fallback = { bookmarked: false };
        setpresentationBookmark(fallback);
        return fallback;
      }
    },
    []
  );

  const postPresentationBookmark = useCallback(
    async (presentationBookmark: PresentationBookmarkRegister) => {
      try {
        await presentationApi.postPresentationBookmark(presentationBookmark);
        await queryClient.invalidateQueries({ queryKey: ["presentationBookmarks"] });
      } catch {}
    },
    [queryClient]
  );

  const deletePresentationBookmark = useCallback(
    async (presentationBookmark: PresentationBookmarkRegister) => {
      try {
        await presentationApi.deletePresentationBookmark(presentationBookmark);
        await queryClient.invalidateQueries({ queryKey: ["presentationBookmarks"] });
      } catch {}
    },
    [queryClient]
  );

  const contextValue = useMemo(
    () => ({
      presentationList,
      presentationBookmark,
      getPresentationAll,
      postPresentationBookmark,
      deletePresentationBookmark,
      getPresentationBookmark,
      getPresentationById,
    }),
    [
      presentationList,
      presentationBookmark,
      getPresentationAll,
      postPresentationBookmark,
      deletePresentationBookmark,
      getPresentationBookmark,
      getPresentationById,
    ]
  );

  return (
    <PresentationContext.Provider value={contextValue}>
      {children}
    </PresentationContext.Provider>
  );
};