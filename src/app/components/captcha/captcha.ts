import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Challenge } from '../../models/challenge';
import { CaptchaService } from '../../service/captcha_service';
import { Router } from '@angular/router';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-captcha',
  imports: [FormField],
  templateUrl: './captcha.html',
  styleUrl: './captcha.css',
})

export class Captcha {

  form!: FormGroup;
  currentChallenge!: Challenge;
  currentStage!: number;
  totalStages!: number;

  constructor(
    private fb: FormBuilder,
  ) { }
  private captchaService = inject(CaptchaService)
  private router = inject(Router)



ngOnInit(): void {
  this.captchaService.loadState();

  if(!this.captchaService.hasActiveSession()) {
  this.router.navigate(['/']);
  return;
}

this.initForm();
this.loadChallenge();
  }

initForm() {
  this.form = this.fb.group({
    answer: ['', Validators.required]
  });
}

loadChallenge() {
  this.currentStage = this.captchaService.getCurrentStage();
  this.totalStages = this.captchaService.getTotalStages();
  this.currentChallenge = this.captchaService.getChallenge(this.currentStage);

  const savedAnswer = this.captchaService.getAnswer(this.currentStage);
  if (savedAnswer) {
    this.form.patchValue({ answer: savedAnswer });
  }
}

next() {
  if (this.form.invalid) return;

  this.captchaService.saveAnswer(
    this.currentStage,
    this.form.value.answer
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
}
