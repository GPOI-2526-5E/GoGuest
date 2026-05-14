import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  visitatoriOggi: number;
  ingressiAttivi: number;
  qrGenerati: number;
  usciteRegistrate: number;
}

export interface VisitatoriMensili {
  mese: number;
  label: string;
  totale: number;
}

export interface DashboardData {
  stats: DashboardStats;
  visitatoriMensili: VisitatoriMensili[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3001/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
