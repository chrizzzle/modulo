export interface Vote {
    _id: string;
    optionId: string;
    sessionId: string;
    userId: string;
    value: boolean;
}
