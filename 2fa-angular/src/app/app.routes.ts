import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {WelcomeComponent} from './pages/welcome/welcome.component';
import {authGuard} from './auth/guard/auth.guard';
import {ProfileComponent} from './pages/profile/profile.component';

export const routes: Routes = [
  {path:"", redirectTo: "login", pathMatch: "full"},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'welcome', component: WelcomeComponent, canActivate: [authGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [authGuard]}
];
