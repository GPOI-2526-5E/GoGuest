import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import SignaturePad from 'signature_pad';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-sign.component',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.css',
})
export class SignComponent implements AfterViewInit {
  
  currentTime$: Observable<Date> = timer(0, 1000).pipe(
    map(() => new Date())
  );

  @ViewChild('signatureCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private signaturePad!: SignaturePad;

  nomeUtente: string = '';
  cognomeUtente: string = '';
  nomeAzienda: string = '';
  source: string = '';
  // Aggiungo una variabile per sapere se è nuovo (di base falso)
  isNuovoUtente: boolean = false; 

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService) {
    const state = history.state;
    this.source = history.state?.sorgente || '';

    if (state) {
      this.nomeUtente = state.nome || '';
      this.cognomeUtente = state.cognome || '';
      this.nomeAzienda = state.azienda || '';
      // Recupero l'informazione dal form precedente
      this.isNuovoUtente = state.isNuovoUtente || false; 
    }
  }

  // Nel tuo sign.component.ts
  // Nel tuo sign.component.ts
  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasRef.nativeElement, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      // Riportiamo i valori allo standard sottile
      minWidth: 0.5, 
      maxWidth: 2.5  
    });
    
    this.resizeCanvas();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    
    this.signaturePad.clear();
  }

  clear(): void {
    this.signaturePad.clear();
  }

  save(): void {
    if (this.signaturePad.isEmpty()) {
      this.notificationService.mostra("Per favore, firma prima di salvare.", 'error');
      return;
    }
    
    const firmaNuova = this.ritagliaFirma(this.canvasRef.nativeElement);
    console.log("Pronto per il DB:", firmaNuova);

    // Se source è "entry", lo stato sarà 1. Altrimenti (uscita) sarà 0.
    const statoVisita = this.source === 'entry' ? 1 : 0; 
    
    if (this.isNuovoUtente) {
      // PERCORSO A: L'utente è NUOVO
      console.log("Utente nuovo! Procedo col salvataggio nel database...");
      
      this.authService.salvaNuovoUtente(this.nomeUtente, this.cognomeUtente, this.nomeAzienda, firmaNuova).subscribe({
        next: (risposta: any) => {
          // Quando salviamo l'utente, il backend ci restituisce il suo nuovo ID
          const nuovoId = risposta.nuovoId; 

          // AGGIORNO LO STATO VISITA
          this.authService.impostaStatoVisita(nuovoId, statoVisita).subscribe({
            next: () => {
              this.notificationService.mostra("Registrazione e ingresso completati! Benvenuto.", 'success');
              this.router.navigate(['/home']); 
            },
            error: (err: any) => console.error("Errore aggiornamento stato:", err)
          });
        },
        error: (erroreSalvataggio: any) => {
          console.error("Errore durante il salvataggio:", erroreSalvataggio);
          this.notificationService.mostra("Errore nel database durante la registrazione. Riprova.", 'error');
        }
      });

    } else {
      // PERCORSO B: L'utente è GIÀ REGISTRATO
      console.log("Utente già registrato! Inizio processo di verifica...");

      this.authService.getVisitatoreID(this.nomeUtente, this.cognomeUtente, this.nomeAzienda).subscribe({
        next: (rispostaId: any) => {
          const idUtente: number = rispostaId.id; 

          this.authService.getFirmaDalDatabase(idUtente).subscribe({
            next: (rispostaDB: any) => {
              const firmaVecchiaStringa = rispostaDB.firma; 

              this.authService.controllaFirma(firmaNuova, firmaVecchiaStringa).then((corrisponde: boolean) => {
                if (corrisponde) {
                  
                  // AGGIORO LO STATO VISITA VISTO CHE LA FIRMA È CORRETTA
                  this.authService.impostaStatoVisita(idUtente, statoVisita).subscribe({
                    next: () => {
                      // Un alert dinamico: "Benvenuto" se entra, "Arrivederci" se esce
                      const messaggio = statoVisita === 1 ? "Bentornato!" : "Arrivederci e grazie!";
                      this.notificationService.mostra(`Successo! La firma è valida. ${messaggio}`, 'success');
                      this.router.navigate(['/home']); 
                    },
                    error: (err: any) => console.error("Errore aggiornamento stato:", err)
                  });

                } else {
                  this.notificationService.mostra("Attenzione: la firma non combacia. Riprova.", 'error');
                  this.clear(); 
                }
              });
            },
            error: (erroreFirma: any) => {
              console.error("Errore recupero firma:", erroreFirma);
              this.notificationService.mostra("Errore nel database durante il recupero della firma.", 'error');
            }
          });
        },
        error: (erroreId: any) => {
          console.error("Errore ricerca utente:", erroreId);
          this.notificationService.mostra("Non abbiamo trovato nessun visitatore registrato con questi dati.", 'error');
        }
      }); 
    }
  }

  private ritagliaFirma(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasPixels = false;

    // Analizza ogni pixel per trovare i margini del testo nero
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Se il pixel non è bianco (r,g,b < 255), allora c'è dell'inchiostro
        if (r < 255 || g < 255 || b < 255) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return canvas.toDataURL('image/png'); // Se è tutto bianco

    // Aggiungiamo 10px di margine (padding) per non tagliare troppo a filo
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const trimWidth = maxX - minX;
    const trimHeight = maxY - minY;

    // Creiamo un mini-canvas grande solo quanto la firma effettiva
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimWidth;
    trimmedCanvas.height = trimHeight;
    const trimmedCtx = trimmedCanvas.getContext('2d');
    
    if (trimmedCtx) {
        // Riempiamo di bianco il nuovo canvas e ci incolliamo la firma ritagliata
        trimmedCtx.fillStyle = 'rgb(255, 255, 255)';
        trimmedCtx.fillRect(0, 0, trimWidth, trimHeight);
        trimmedCtx.putImageData(ctx.getImageData(minX, minY, trimWidth, trimHeight), 0, 0);
    }

    return trimmedCanvas.toDataURL('image/png');
  }
}