import axiosInstance from "@/utils/api";
import type { AxiosResponse } from "axios";

interface ContactRequest {
  name: string;
  email: string;
  text: string;
}

const baseUrl = "/mailing";

export const sendContactRequest = async (
  data: ContactRequest,
): Promise<AxiosResponse> => {
  return axiosInstance.post(`${baseUrl}/contact`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};