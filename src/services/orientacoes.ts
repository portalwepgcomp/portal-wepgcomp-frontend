"use client"
import axiosInstance from '@/utils/api';
import { OrientacaoParams } from '@/models/orientacoes';

const baseUrl = "/guidance";

export const orientacoesApi = {
    getOrientacoes: async () => {
        const { data } = await axiosInstance.get(`${baseUrl}`);
        return data;
    },

    getOrientacaoById: async (idOrientacao: string) => {
        const instance = axiosInstance;

        const { data } = await instance.get(`${baseUrl}/${idOrientacao}`);

        return data;
    },

    postOrientacao: async (body: OrientacaoParams) => {
        const instance = axiosInstance;

        const { data } = await instance.post(`${baseUrl}`, body);

        return data;
    },

    putOrientacao: async (idOrientacao: string, body: OrientacaoParams) => {
        const instance = axiosInstance;

        const { data } = await instance.put(`${baseUrl}/${idOrientacao}`, body);

        return data;
    },
    
    putOrientacaoActive: async (body: OrientacaoParams) => {
        const instance = axiosInstance;

        const { data } = await instance.put(`${baseUrl}/active`, body);

        return data;
    },

    deleteOrientacaoById: async (idOrientacao: string) => {
        const instance = axiosInstance;

        const { data } = await instance.delete(`${baseUrl}/${idOrientacao}`);

        return data;
    },
}