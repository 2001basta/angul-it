export interface Challenge {
    id: number;
    type: 'image' | 'math' | 'text';
    question: string;
    options?: string[];
    correctAnswer: any;
}

export interface CaptchaState {
    challenges: Challenge[];
    answers: any[];
    currentStage: number;
    completed: boolean;
}