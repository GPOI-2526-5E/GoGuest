import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ElencoVisiteComponent } from './features/elenco-visite/elenco-visite.component';
import { RegistraVisitatoreComponent } from './features/registra-visitatore/registra-visitatore.component';
import { RegistrazioneLoginComponent } from './features/registrazione-login.component/registrazione-login.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/auth.guard';


export const routes: Routes = [
  { path: '',              redirectTo: '/login',        pathMatch: 'full' },
  { path: 'login',         component: LoginComponent },
  { path: 'registrazione', component: RegistrazioneLoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard',     component: DashboardComponent,     canActivate: [authGuard] },


  { path: 'elenco-visite', component: ElencoVisiteComponent,  canActivate: [authGuard] },
  { path: 'entry',         component: RegistraVisitatoreComponent, canActivate: [authGuard] },
  { path: 'profile',       component: ProfileComponent, canActivate: [authGuard] },
  { path: '**',            redirectTo: '/login' },

];
