import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Challenge } from '../../models/challenge';
import { CaptchaService } from '../../service/captcha_service';
import { Router } from '@angular/router';

function requiredArray(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-captcha',
  imports: [ReactiveFormsModule],
  templateUrl: './captcha.html',
  styleUrl: './captcha.css',
})

export class Captcha {

  form!: FormGroup;
  currentChallenge!: Challenge;
  currentStage!: number;
  totalStages!: number;
  answerIncorrect = false;

  constructor(
    private fb: FormBuilder,
  ) { }
  private captchaService = inject(CaptchaService)
  private router = inject(Router)



  ngOnInit(): void {
    this.captchaService.loadState();

    if (!this.captchaService.hasActiveSession()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadChallenge();
  }

  initForm() {
    const isImage = this.currentChallenge?.type === 'image';
    this.form = this.fb.group({
      answer: [isImage ? [] : '', isImage ? requiredArray : Validators.required]
    });
    this.answerIncorrect = false;
    this.form.get('answer')!.valueChanges.subscribe(() => this.answerIncorrect = false);
  }

  loadChallenge() {
    this.currentStage = this.captchaService.getCurrentStage();
    this.totalStages = this.captchaService.getTotalStages();
    this.currentChallenge = this.captchaService.getChallenge(this.currentStage);

    this.initForm();

    const savedAnswer = this.captchaService.getAnswer(this.currentStage);
    if (savedAnswer) {
      this.form.patchValue({ answer: savedAnswer });
    }
  }

  toggleImageOption(id: string): void {
    const control = this.form.get('answer')!;
    const current: string[] = Array.isArray(control.value) ? control.value : [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    control.setValue(next);
    control.markAsTouched();
  }

  isImageSelected(id: string): boolean {
    const value = this.form.get('answer')?.value;
    return Array.isArray(value) && value.includes(id);
  }

  iconName(optionId: string): string {
    return optionId.split('-')[0];
  }

  next() {
    if (this.form.invalid) return;
    let resp = this.currentChallenge.type === 'math' ? Number(this.form.value.answer): this.form.value.answer;

    if (!this.captchaService.isAnswerCorrect(this.currentChallenge, resp)) {
      this.answerIncorrect = true;
      return;
    }

    this.captchaService.saveAnswer(
      this.currentStage,
      resp
    );

    if (this.currentStage + 1 === this.totalStages) {
      this.captchaService.markAsCompleted();
      this.router.navigate(['/result']);
      return;
    }

    this.captchaService.setStage(this.currentStage + 1);
    this.loadChallenge();
  }

  previous() {
    if (this.currentStage === 0) return;

    this.captchaService.setStage(this.currentStage - 1);
    this.loadChallenge();
  }

  get stageIndices(): number[] {
    return Array.from({ length: this.totalStages }, (_, i) => i);
  }

  get isLastStage(): boolean {
    return this.currentStage + 1 === this.totalStages;
  }
}
