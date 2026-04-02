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
  // 1. Aggiungiamo una variabile per sapere se è nuovo (di base falso)
  isNuovoUtente: boolean = false; 

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService) {
    const state = history.state;
    this.source = history.state?.sorgente || '';

    if (state) {
      this.nomeUtente = state.nome || '';
      this.cognomeUtente = state.cognome || '';
      this.nomeAzienda = state.azienda || '';
      // 2. Recuperiamo l'informazione dal form precedente!
      this.isNuovoUtente = state.isNuovoUtente || false; 
    }
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasRef.nativeElement, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)'
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
    
    const firmaNuova = this.signaturePad.toDataURL('image/png');
    console.log("Pronto per il DB:", firmaNuova);

    // 1. CAPIAMO SE ENTRA O ESCE
    // Se source è "entry", lo stato sarà 1. Altrimenti (uscita) sarà 0.
    const statoVisita = this.source === 'entry' ? 1 : 0; 
    
    if (this.isNuovoUtente) {
      // ----------------------------------------
      // PERCORSO A: L'utente è NUOVO
      // ----------------------------------------
      console.log("Utente nuovo! Procedo col salvataggio nel database...");
      
      this.authService.salvaNuovoUtente(this.nomeUtente, this.cognomeUtente, this.nomeAzienda, firmaNuova).subscribe({
        next: (risposta: any) => {
          // Quando salviamo l'utente, il backend ci restituisce il suo nuovo ID!
          const nuovoId = risposta.nuovoId; 

          // AGGIORNIAMO LO STATO VISITA
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
      // ----------------------------------------
      // PERCORSO B: L'utente è GIÀ REGISTRATO
      // ----------------------------------------
      console.log("Utente già registrato! Inizio processo di verifica...");

      this.authService.getVisitatoreID(this.nomeUtente, this.cognomeUtente, this.nomeAzienda).subscribe({
        next: (rispostaId: any) => {
          const idUtente: number = rispostaId.id; 

          this.authService.getFirmaDalDatabase(idUtente).subscribe({
            next: (rispostaDB: any) => {
              const firmaVecchiaStringa = rispostaDB.firma; 

              this.authService.controllaFirma(firmaNuova, firmaVecchiaStringa).then((corrisponde: boolean) => {
                if (corrisponde) {
                  
                  // AGGIORNIAMO LO STATO VISITA VISTO CHE LA FIRMA È CORRETTA!
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
}