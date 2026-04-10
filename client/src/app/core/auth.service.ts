import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ssim } from 'ssim.js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // CENTRALIZZIAMO L'URL: Modifica solo questa riga quando andrai in produzione!
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getVisitatoreID(nome: string, cognome: string, azienda: string): Observable<any> {
    // Usiamo il baseUrl dinamico
    const urlConParametri = `${this.baseUrl}/idVisitatore?nome=${nome}&cognome=${cognome}&azienda=${azienda}`;
    return this.http.get(urlConParametri);
  }

  getFirmaDalDatabase(idVisitatore: number): Observable<any> {
    // Usiamo il baseUrl dinamico
    return this.http.get(`${this.baseUrl}/firma/${idVisitatore}`);
  }

  // --- NUOVA FUNZIONE: Converte il Base64 in ImageData e lo ridimensiona ---
  private normalizzaImmagine(base64: string, width: number = 400, height: number = 200): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; 
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return reject('Contesto Canvas non disponibile');
        }

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(ctx.getImageData(0, 0, width, height));
      };
      
      img.onerror = (err) => reject(err);
      img.src = base64;
    });
  }

  // --- NUOVA FUNZIONE DI CONTROLLO CON SSIM ---
  async controllaFirma(firmaNuova: string, firmaDalDatabase: string): Promise<boolean> {
    try {
      const imgDataNuova = await this.normalizzaImmagine(firmaNuova);
      const imgDataDatabase = await this.normalizzaImmagine(firmaDalDatabase);

      const risultato = ssim(imgDataNuova, imgDataDatabase);
      
      console.log(`Indice di similitudine SSIM: ${risultato.mssim}`);

      const SOGLIA_ACCETTAZIONE = 0.60;

      if (risultato.mssim >= SOGLIA_ACCETTAZIONE) {
        return true; 
      } else {
        return false; 
      }

    } catch (errore) {
      console.error("Errore durante il confronto SSIM:", errore);
      return false; 
    }
  }

  salvaNuovoUtente(nome: string, cognome: string, azienda: string, firma: string): Observable<any> {
    // Usiamo il baseUrl dinamico
    const datiUtente = { nome, cognome, azienda, firma };
    return this.http.post(`${this.baseUrl}/nuovoUtente`, datiUtente);
  }

  impostaStatoVisita(id: number, stato: number): Observable<any> {
    // Usiamo il baseUrl dinamico
    return this.http.post(`${this.baseUrl}/impostaStato`, { id, stato });
  }
}