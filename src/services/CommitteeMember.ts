"use client"
import axiosInstance from '@/utils/api';
import { Committer } from '@/models/committer';

const instance = axiosInstance;
const baseUrl = "/committee-member/";

export const committerMembersApi = {
    
    getAllMembers: async (eventEditionId: string): Promise<Committer[]> => {
        const { data } = await instance.get(`${baseUrl}${eventEditionId ? "?eventEditionId=" + eventEditionId : ""}`);

        return data;
    },

    getMemberById: async (idMember: string) => {
        const { data } = await instance.get(`${baseUrl}/${idMember}`);

        return data;
    }
}