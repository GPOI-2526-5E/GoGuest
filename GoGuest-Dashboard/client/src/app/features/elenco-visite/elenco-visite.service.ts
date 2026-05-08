import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Periodo = 'oggi' | 'mese' | 'anno';

export interface Visita {
  IdVisita: number;
  Nome: string;
  Cognome: string;
  Azienda: string | null;
  Email: string | null;
  NomeReferente: string | null;
  DataOraIngresso: string | null;
  DataOraUscita: string | null;
  VisitaAttiva: number;
}

@Injectable({ providedIn: 'root' })
export class ElencoVisiteService {
  private apiUrl = 'http://localhost:3001/api/visite';

  constructor(private http: HttpClient) {}

  getVisite(periodo: Periodo): Observable<Visita[]> {
    return this.http.get<Visita[]>(`${this.apiUrl}?periodo=${periodo}`);
  }
}
