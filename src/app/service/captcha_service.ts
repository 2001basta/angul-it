import { Injectable, signal } from "@angular/core";
import { Challenge } from "../models/challenge";


interface CaptchaState {
    challenges: Challenge[];
    answers: any[];
    currentStage: number;
    completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class CaptchaService {

    private currentStage = signal(0);
    private state = signal<CaptchaState>({
        challenges: [],
        answers: [],
        currentStage: 0,
        completed: false
    })

    private readonly STORAGE_KEY = 'captchaState';
    constructor() {
        this.loadState();
    }


    generateSession(): void {
        const challengeBank: Challenge[] = this.getChallengeBank();

        this.state().challenges = this.shuffle(challengeBank).slice(0, 3);
        this.state().answers = [];
        this.state().currentStage = 0;
        this.state().completed = false;

        this.saveState();
    }
    resetState(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.state.set({
            challenges: [],
            answers: [],
            currentStage: 0,
            completed: false
        });
    }
    hasActiveSession(): boolean {
        return this.state().challenges.length > 0;
    }
    markAsCompleted(): void {
        this.state().completed = true;
        this.saveState();
    }
    isCompleted(): boolean {
        return this.state().completed;
    }
    nextStage() {
        this.currentStage.set(this.currentStage() + 1);
        this.saveState();
    }
    getCurrentStage(): number {
        return this.state().currentStage;
    }
    setStage(stage: number): void {
        this.state().currentStage = stage;
        this.saveState();
    }
    getTotalStages(): number {
        return this.state().challenges.length;
    }
    getChallenge(index: number): Challenge {
        return this.state().challenges[index];
    }
    getAnswer(index: number): any {
        return this.state().answers[index];
    }
    saveAnswer(index: number, answer: any): void {
        this.state().answers[index] = answer;
        this.saveState();
    }
    calculateScore(): number {
        let score = 0;

        this.state().challenges.forEach((challenge, index) => {
            const userAnswer = this.state().answers[index];

            if (this.isCorrectAnswer(challenge.correctAnswer, userAnswer)) {
                score++;
            }
        });

        return score;
    }
    private isCorrectAnswer(correct: any, user: any): boolean {
        if (Array.isArray(correct)) {
            return JSON.stringify(correct.sort()) ===
                JSON.stringify((user || []).sort());
        }

        return correct === user;
    }

    // saveAnswer(answer: any) {
    //     this.answers.update(arr => {
    //         const newarr = [...arr];
    //         newarr[this.getCurrentStage()] = answer;
    //         return newarr;
    //     })
    //     this.saveState();
    // }
    private saveState(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    }

    loadState(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
    private getChallengeBank(): Challenge[] {
        return [
            {
                id: 1,
                type: 'math',
                question: 'What is 5 + 3?',
                correctAnswer: 8
            },
            {
                id: 2,
                type: 'text',
                question: 'Type the word "Angular"',
                correctAnswer: 'Angular'
            },
            {
                id: 3,
                type: 'math',
                question: 'What is 10 - 4?',
                correctAnswer: 6
            },
            {
                id: 4,
                type: 'text',
                question: 'Type the word "Captcha"',
                correctAnswer: 'Captcha'
            }
        ];
    }
    private shuffle(array: Challenge[]): Challenge[] {
        return array.sort(() => Math.random() - 0.5);
    }
    getDetailedResults() {
        return this.state().challenges.map((challenge, index) => ({
            question: challenge.question,
            correctAnswer: challenge.correctAnswer,
            userAnswer: this.state().answers[index],
            isCorrect: this.isCorrectAnswer(
                challenge.correctAnswer,
                this.state().answers[index]
            )
        }));
    }
}