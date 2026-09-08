"use client";
import axiosInstance from "@/utils/api";

const baseUrl = "/uploads";
const instance = axiosInstance;

export const uploadApi = {
  listFiles: async () => {
    const { data } = await instance.get(`${baseUrl}/list`);

    return data;
  },

  sendFile: async (
    file: File,
    idSubmission: string,
    desiredFilename?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file, desiredFilename || file.name);
    formData.append("idSubmission", idSubmission);

    const { data } = await instance.post(`${baseUrl}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  deleteFile: async (filename: string) => {
    const { data } = await instance.delete(`${baseUrl}/${filename}`);

    return data;
  },
};
