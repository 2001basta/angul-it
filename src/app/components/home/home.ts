import { Component, inject } from '@angular/core';
import { CaptchaService } from '../../service/captcha_service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private captchaService = inject(CaptchaService)
  private router = inject(Router)

  startChanllenge(){
    this.captchaService.resetState();
    this.captchaService.generateSession();
    this.router.navigate(['/captcha'])
  }
}
