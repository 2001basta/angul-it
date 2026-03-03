import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaService } from '../../service/captcha_service';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.html',
  styleUrl: './result.css',
})

export class Result {

  score = signal(0);
  total= signal(0);
  results = signal<any[]>([]);

  private captchaService = inject(CaptchaService)
  private router = inject(Router)

  ngOnInit(): void {
    if (!this.captchaService.isCompleted()) {
      this.router.navigate(['/captcha']);
      return;
    }

    this.score.set(this.captchaService.calculateScore());
    this.total.set(this.captchaService.getTotalStages());
    this.results.set(this.captchaService.getDetailedResults());
  }

  restart() {
    this.captchaService.resetState();
    this.router.navigate(['/']);
  }
}