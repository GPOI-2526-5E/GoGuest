import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ElencoVisiteComponent } from './features/elenco-visite/elenco-visite.component';

export const routes: Routes = [
  { path: '',              redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',     component: DashboardComponent },
  { path: 'elenco-visite', component: ElencoVisiteComponent },
];
