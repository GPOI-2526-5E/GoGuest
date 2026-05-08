import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ElencoVisiteComponent } from './features/elenco-visite/elenco-visite.component';

export const routes: Routes = [
  { path: '',              redirectTo: 'login',        pathMatch: 'full' },
  { path: 'login',         component: LoginComponent },
  { path: 'dashboard',     component: DashboardComponent },
  { path: 'elenco-visite', component: ElencoVisiteComponent },
];
