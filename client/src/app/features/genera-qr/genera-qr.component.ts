import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QrService } from '../../core/qr.service';

@Component({
  selector: 'app-genera-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genera-qr.component.html',
  styleUrls: ['./genera-qr.component.css']
})
export class GeneraQrComponent implements OnInit, OnDestroy {
  stato: 'caricamento' | 'successo' | 'errore' = 'caricamento';
  secondiRimasti: number = 5;
  messaggioErrore: string = '';
  private timerInterval: any;

  datiUtente = {
    nome: '',
    cognome: '',
    email: '',
    referente: ''
  };

  constructor(private router: Router, private qrService: QrService) {
    const state = history.state;
    if (state) {
      this.datiUtente.nome = state.nome || '';
      this.datiUtente.cognome = state.cognome || '';
      this.datiUtente.email = state.email || '';
      this.datiUtente.referente = state.referente || '';
    }
  }

  ngOnInit(): void {
    if (!this.datiUtente.nome || !this.datiUtente.cognome) {
      this.mostraErrore('Dati utente mancanti. Impossibile generare il QR code.');
      return;
    }

    this.qrService.generateQr(this.datiUtente).subscribe({
      next: (res) => {
        this.stato = 'successo';
        this.avviaTimerRitornoHome();
      },
      error: (err) => {
        console.error('Errore durante la generazione del QR:', err);
        this.mostraErrore('Si è verificato un errore durante la generazione o l\'invio del QR code.');
      }
    });
  }

  avviaTimerRitornoHome() {
    this.timerInterval = setInterval(() => {
      this.secondiRimasti--;
      if (this.secondiRimasti <= 0) {
        clearInterval(this.timerInterval);
        this.tornaAllaHome();
      }
    }, 1000);
  }

  mostraErrore(messaggio: string) {
    this.stato = 'errore';
    this.messaggioErrore = messaggio;
  }

  tornaAllaHome() {
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
