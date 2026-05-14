import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ElencoVisiteComponent } from './features/elenco-visite/elenco-visite.component';
import { RegistraVisitatoreComponent } from './features/registra-visitatore/registra-visitatore.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '',              redirectTo: '/login',        pathMatch: 'full' },
  { path: 'login',         component: LoginComponent },
  { path: 'dashboard',     component: DashboardComponent,     canActivate: [authGuard] },
  { path: 'elenco-visite', component: ElencoVisiteComponent,  canActivate: [authGuard] },
  { path: 'entry',         component: RegistraVisitatoreComponent, canActivate: [authGuard] },
  { path: '**',            redirectTo: '/login' },
];
