import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Captcha } from './components/captcha/captcha';
import { Result } from './components/result/result';
import { ResultGuard } from './guard/guard';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'captcha', component: Captcha},
    {path: 'result', component: Result, canActivate: [ResultGuard]},
    { path: '**', redirectTo: '' }
];
