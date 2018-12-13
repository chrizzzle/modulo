export interface Session {
    _id: string;
    timer: number;
    countdown: number;
    active: boolean;
    percent: number;
    question: string;
    description: string;
}
