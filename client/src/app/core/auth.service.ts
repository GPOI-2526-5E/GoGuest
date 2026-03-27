import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import resemble from 'resemblejs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  // L'indirizzo del backend Node.js
  private getFirmaURL = 'http://localhost:3000/api/firma';

  constructor(private http: HttpClient) { }

 getVisitatoreID(nome: string, cognome: string, azienda: string): Observable<any> {
    
    // Costruiamo l'indirizzo aggiungendo i parametri di ricerca alla fine (Query Parameters)
    // Esempio: http://localhost:3000/api/idVisitatore?nome=Mario&cognome=Rossi&azienda=Acme
    const urlConParametri = `http://localhost:3000/api/idVisitatore?nome=${nome}&cognome=${cognome}&azienda=${azienda}`;
    
    return this.http.get(urlConParametri);
  }

  // Chiede al backend la firma salvata nel database
  getFirmaDalDatabase(idVisitatore: number): Observable<any> {
    return this.http.get(`${this.getFirmaURL}/${idVisitatore}`);
  }

  // Funzione di controllo
  controllaFirma(firmaNuova: string, firmaDalDatabase: string): Promise<boolean> {
    return new Promise((resolve) => {
      resemble(firmaNuova)
        .compareTo(firmaDalDatabase)
        .ignoreColors()
        .onComplete((data: any) => {
          const differenza = Number(data.misMatchPercentage);
          console.log(`Differenza firme: ${differenza}%`);
          
          // Se la differenza è minore del 20%, restituisce true (firma valida)
          if (differenza < 20) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }
}
