import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  generateQr(datiUtente: { nome: string, cognome: string, email: string, referente: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-qr`, datiUtente);
  }
}
