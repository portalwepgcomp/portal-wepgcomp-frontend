export interface OrientacaoParams {
    summary?: string;
    authorGuidance?: string;
    reviewerGuidance?: string;
    audienceGuidance?: string;
    eventEditionId: string;
}

export interface Orientacao extends OrientacaoParams {
    id: string;
    createdAt: string;
    deletedAt: string;
    updatedAt: string;
}