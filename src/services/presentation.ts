import axiosInstance from "@/utils/api";
import {
  Presentation,
  PresentationBookmarkRegister,
  PresentationBookmark,
} from "@/models/presentation";
import { BookmarkedPresentations } from "@/models/presentatio-bookmarks";

const baseUrl = "/presentation";
const instance = axiosInstance;

export const presentationApi = {
  getPresentations: async (eventEditionId: string): Promise<Presentation[]> => {
    const { data } = await instance.get(`${baseUrl}`, {
      params: { eventEditionId },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  },

  getPresentationById: async (id: string): Promise<Presentation> => {
    const { data } = await instance.get(`${baseUrl}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  },

  getPresentationBookmark: async (
    params: PresentationBookmarkRegister,
  ): Promise<PresentationBookmark> => {
    const { data } = await instance.get(`${baseUrl}/bookmark`, {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  },

  getPresentationBookmarks: async (
    eventEditionId: string,
    signal?: AbortSignal,
  ): Promise<BookmarkedPresentations> => {
    if (!eventEditionId) return { bookmarkedPresentations: [] };
    const { data } = await instance.get<BookmarkedPresentations>(`${baseUrl}/bookmarks`, {
      params: { eventEditionId },
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // A API atual ainda pode devolver favoritos de outras edições (issue API #2).
    return {
      bookmarkedPresentations: data.bookmarkedPresentations.filter(
        (item) => item.submission?.eventEditionId === eventEditionId,
      ),
    };
  },

  postPresentationBookmark: async (body: PresentationBookmarkRegister) => {
    const { data } = await instance.post(`${baseUrl}/bookmark`, body)

    return data
  },

  deletePresentationBookmark: async (params: PresentationBookmarkRegister) => {
    const { data } = await instance.delete(`${baseUrl}/bookmark`, { params })

    return data
  },

  calculateAllScores: async (eventEditionId: string) => {
    const { data } = await instance.post(`${baseUrl}/calculate-all-scores/${eventEditionId}`)

    return data
  },

  resetEvaluatorsScores: async (eventEditionId: string) => {
    const { data } = await instance.post(`${baseUrl}/reset-evaluators-scores/${eventEditionId}`)

    return data
  },

  resetPublicScores: async (eventEditionId: string) => {
    const { data } = await instance.post(`${baseUrl}/reset-public-scores/${eventEditionId}`)

    return data
  },

  resetCommitteeScores: async (eventEditionId: string) => {
    const { data } = await instance.post(`${baseUrl}/reset-committee-scores/${eventEditionId}`)

    return data
  },
}
