"use client";
import axiosInstance from "@/utils/api";
import {
  EvaluationParams,
  EvaluationCriteriaParams,
  AnonymousEvaluationParams,
  EvaluationContextData,
} from "@/models/evaluation";

const baseUrl = "/evaluations";
const baseUrlCriteria = "/evaluation-criteria";
const instance = axiosInstance;

export const evaluationApi = {
  getEvaluationContext: async (
    presentationId: string,
  ): Promise<EvaluationContextData> => {
    const { data } = await instance.get(`${baseUrl}/context/${presentationId}`);
    return data;
  },

  makeAnonymousEvaluation: async (body: AnonymousEvaluationParams) => {
    const { data } = await instance.put(`${baseUrl}/anonymous`, body);
    return data;
  },

  makeEvaluation: async (body: EvaluationParams[]) => {
    const { data } = await instance.put(`${baseUrl}`, body);

    return data;
  },

  getEvaluationByUser: async (userId: string) => {
    const { data } = await instance.get(`${baseUrl}?userId=${userId}`);

    return data;
  },

  getEvaluation: async (submissionId: string) => {
    const { data } = await instance.get(
      `${baseUrl}/submission/${submissionId}/final-grade`,
    );

    return data;
  },

  getEvaluationCriteria: async (eventEditionId: string) => {
    const { data } = await instance.get(`${baseUrlCriteria}/${eventEditionId}`);

    return data;
  },

  createEvaluationCriteria: async (body: EvaluationCriteriaParams[]) => {
    const { data } = await instance.post(`${baseUrlCriteria}/batch`, body);

    return data;
  },

  updateEvaluationCriteria: async (body: EvaluationCriteriaParams[]) => {
    const { data } = await instance.put(`${baseUrlCriteria}/batch`, body);

    return data;
  },
};
