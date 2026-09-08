export interface EvaluationParams{
    userId?: string;
    submissionId: string;
    evaluationCriteriaId: string;
    score: number;
    comments?: string;
}

export interface Evaluation extends EvaluationParams{
    id?: string;
    email?: string;
    name?: string;
}

export interface EvaluationCriteriaParams{
    id?: string;
    eventEditionId: string;
    title: string;
    description: string;
    weightRadio: number | null;
}

export interface EvaluationCriteria extends EvaluationCriteriaParams{
    createdAt: Date;
    updatedAt: Date;
}