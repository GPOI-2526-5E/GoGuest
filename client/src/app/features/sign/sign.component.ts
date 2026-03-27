import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import SignaturePad from 'signature_pad';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sign.component',
  imports: [CommonModule],
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

  constructor(private router: Router, private authService: AuthService) {
    const state = history.state;
    this.source = history.state?.sorgente || '';

    if (state) {
      this.nomeUtente = state.nome || '';
      this.cognomeUtente = state.cognome || '';
      this.nomeAzienda = state.azienda || '';
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
      alert("Per favore, firma prima di salvare.");
      return;
    }
    
    const firmaNuova = this.signaturePad.toDataURL('image/png');
    console.log("Pronto per il DB:", firmaNuova);

    // PASSO 1: Chiediamo prima l'ID al server
    this.authService.getVisitatoreID(this.nomeUtente, this.cognomeUtente, this.nomeAzienda).subscribe({
      next: (rispostaId: any) => {
        // Apriamo il primo pacco per prendere il VERO numero
        const idUtente: number = rispostaId.id; 
        console.log(`Visitatore trovato! Il suo ID è ${idUtente}`);

        // PASSO 2: Ora che abbiamo il numero, chiediamo la firma
        this.authService.getFirmaDalDatabase(idUtente).subscribe({
          next: (rispostaDB: any) => {
            const firmaVecchiaStringa = rispostaDB.firma; 
            console.log("Firma vecchia recuperata! Inizio il confronto...");

            // PASSO 3: Facciamo il controllo con la libreria Resemble
            this.authService.controllaFirma(firmaNuova, firmaVecchiaStringa).then((corrisponde: boolean) => {
              
              if (corrisponde) {
                alert("Successo! La firma è valida. Puoi entrare.");
                // PASSO 4: Navighiamo alla home SOLO se la firma è corretta!
                this.router.navigate(['/home']); 
              } else {
                alert("Attenzione: la firma non combacia. Riprova.");
                this.clear(); // Opzionale: puliamo la lavagna se ha sbagliato
              }
              
            });
          },
          error: (erroreFirma: any) => {
            console.error("Errore recupero firma:", erroreFirma);
            alert("Errore nel database durante il recupero della firma.");
          }
        }); // Fine subscribe Firma
      },
      error: (erroreId: any) => {
        console.error("Errore ricerca utente:", erroreId);
        alert("Non abbiamo trovato nessun visitatore registrato con questi dati.");
      }
    }); // Fine subscribe ID
  }
}