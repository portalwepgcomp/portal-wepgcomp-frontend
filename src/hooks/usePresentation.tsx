import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import { BookmarkedPresentations } from "@/models/presentatio-bookmarks";
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
  presentationBookmarks: BookmarkedPresentations;
  getPresentationAll: (eventEditionId: string) => Promise<void>;
  getPresentationBookmark: (
    presentationBookmark: PresentationBookmarkRegister
  ) => Promise<PresentationBookmark>;
  getPresentationBookmarks: () => Promise<
    BookmarkedPresentations | { bookmarked: boolean }
  >;
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
  const [presentationBookmarks, setPresentationbookmarks] =
    useState<BookmarkedPresentations>({
      bookmarkedPresentations: [],
    });

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

  const getPresentationBookmarks = useCallback(async () => {
    try {
      const response = await presentationApi.getPresentationBookmarks();
      setPresentationbookmarks(response);
      return response;
    } catch {
      const fallback = { bookmarked: false };
      setpresentationBookmark(fallback);
      return fallback;
    }
  }, []);

  const postPresentationBookmark = useCallback(
    async (presentationBookmark: PresentationBookmarkRegister) => {
      try {
        await presentationApi.postPresentationBookmark(presentationBookmark);
      } catch {}
    },
    []
  );

  const deletePresentationBookmark = useCallback(
    async (presentationBookmark: PresentationBookmarkRegister) => {
      try {
        await presentationApi.deletePresentationBookmark(presentationBookmark);
        await getPresentationBookmarks();
      } catch {}
    },
    [getPresentationBookmarks]
  );

  const contextValue = useMemo(
    () => ({
      presentationList,
      presentationBookmark,
      presentationBookmarks,
      getPresentationAll,
      postPresentationBookmark,
      deletePresentationBookmark,
      getPresentationBookmark,
      getPresentationBookmarks,
      getPresentationById,
    }),
    [
      presentationList,
      presentationBookmark,
      presentationBookmarks,
      getPresentationAll,
      postPresentationBookmark,
      deletePresentationBookmark,
      getPresentationBookmark,
      getPresentationBookmarks,
      getPresentationById,
    ]
  );

  return (
    <PresentationContext.Provider value={contextValue}>
      {children}
    </PresentationContext.Provider>
  );
};