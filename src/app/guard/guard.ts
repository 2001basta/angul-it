import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CaptchaService } from '../service/captcha_service';

@Injectable({
  providedIn: 'root'
})
export class ResultGuard implements CanActivate {

    private router = inject(Router)
    private captchaService = inject(CaptchaService)

  canActivate(): boolean {

    if (this.captchaService.isCompleted()) {
      return true;
    }

    this.router.navigate(['/captcha']);
    return false;
  }
}