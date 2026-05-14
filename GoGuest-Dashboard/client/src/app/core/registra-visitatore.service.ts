import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvitoVisitatore {
  nome: string;
  cognome: string;
  dataNascita: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class RegistraVisitatoreService {
  // Using the dashboard server running on port 3001
  private apiUrl = 'http://localhost:3001/api/invita-visitatore';

  constructor(private http: HttpClient) {}

  invitaVisitatore(dati: InvitoVisitatore): Observable<any> {
    return this.http.post<any>(this.apiUrl, dati);
  }
}
