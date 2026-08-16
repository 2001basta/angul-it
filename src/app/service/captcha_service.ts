import { Injectable, signal , PLATFORM_ID} from "@angular/core";
import { Challenge } from "../models/challenge";
import { CaptchaState } from "../models/challenge";
import { isPlatformBrowser } from '@angular/common';
import { Inject } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class CaptchaService {

    private state = signal<CaptchaState>({
        challenges: [],
        answers: [],
        currentStage: 0,
        completed: false
    })

    private readonly STORAGE_KEY = 'captchaState';
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.loadState();
    }


    generateSession(): void {
        const challengeBank: Challenge[] = this.getChallengeBank();

        this.state.set({
            challenges: this.shuffle(challengeBank).slice(0, 3),
            answers: [],
            currentStage: 0,
            completed: false
        });

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
        this.state.update(s => ({ ...s, completed: true }));
        this.saveState();
    }
    isCompleted(): boolean {
        return this.state().completed;
    }
    getCurrentStage(): number {
        return this.state().currentStage;
    }
    setStage(stage: number): void {
        this.state.update(s => ({ ...s, currentStage: stage }));
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
        this.state.update(s => {
            const answers = [...s.answers];
            answers[index] = answer;
            return { ...s, answers };
        });
        this.saveState();
    }
    isAnswerCorrect(challenge: Challenge, answer: any): boolean {
        return this.isCorrectAnswer(challenge.correctAnswer, answer);
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
        if (isPlatformBrowser(this.platformId) && this.state()) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
        }
    }

    loadState(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.state.set(JSON.parse(saved));
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
            },
            {
                id: 5,
                type: 'image',
                question: "Sélectionnez toutes les voitures",
                options: ['car-1', 'bike-1', 'tree-1', 'car-2', 'house-1', 'umbrella-1', 'car-3', 'bus-1', 'star-1'],
                correctAnswer: ['car-1', 'car-2', 'car-3']
            },
            {
                id: 6,
                type: 'image',
                question: "Sélectionnez tous les arbres",
                options: ['house-1', 'tree-1', 'sun-1', 'bike-1', 'tree-2', 'cloud-1', 'bus-1', 'tree-3', 'star-1'],
                correctAnswer: ['tree-1', 'tree-2', 'tree-3']
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