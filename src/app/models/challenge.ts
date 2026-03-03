export interface Challenge {
    id: number;
    type: 'image' | 'math' | 'text';
    question: string;
    options?: string[];
    correctAnswer: any;
}