import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ssim } from 'ssim.js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getVisitatoreID(nome: string, cognome: string, azienda?: string, dateOfBirth?: string): Observable<any> {
    let urlConParametri = `${this.baseUrl}/idVisitatore?nome=${nome}&cognome=${cognome}`;

    if (azienda && azienda !== 'undefined') {
      urlConParametri += `&azienda=${azienda}`;
    }

    if (dateOfBirth && dateOfBirth !== 'undefined') {
      urlConParametri += `&dateOfBirth=${dateOfBirth}`;
    }

    return this.http.get(urlConParametri);
  }

  getFirmaDalDatabase(idVisitatore: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/firma/${idVisitatore}`);
  }

  private normalizzaImmagine(base64: string, width: number = 400, height: number = 200): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; 
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Contesto Canvas non disponibile');

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(ctx.getImageData(0, 0, width, height));
      };
      
      img.onerror = (err) => reject(err);
      img.src = base64;
    });
  }

  async controllaFirma(firmaNuova: string, firmaDalDatabase: string): Promise<boolean> {
    try {
      const imgDataNuova = await this.normalizzaImmagine(firmaNuova);
      const imgDataDatabase = await this.normalizzaImmagine(firmaDalDatabase);
      const risultato = ssim(imgDataNuova, imgDataDatabase);
      
      console.log(`Similitudine: ${risultato.mssim}`);
      return risultato.mssim >= 0.55;
    } catch (errore) {
      console.error("Errore confronto:", errore);
      return false; 
    }
  }

  salvaNuovoUtente(nome: string, cognome: string, azienda: string, dataNascita: string, firma: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/nuovoUtente`, {
      nome, cognome, azienda, dataNascita, firma, email
    });
  }

  impostaStatoVisita(id: number, stato: number, referente?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/impostaStato`, { id, stato, referente });
  }
}