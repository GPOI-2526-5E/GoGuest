import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistraVisitatoreService, InvitoVisitatore } from '../../core/registra-visitatore.service';

@Component({
  selector: 'app-registra-visitatore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registra-visitatore.component.html',
  styleUrl: './registra-visitatore.component.css'
})
export class RegistraVisitatoreComponent {
  dati: InvitoVisitatore = {
    nome: '',
    cognome: '',
    dataNascita: '',
    email: ''
  };

  stato: 'idle' | 'caricamento' | 'successo' | 'errore' = 'idle';
  messaggio: string = '';

  constructor(private registraService: RegistraVisitatoreService) {}

  inviaInvito() {
    if (!this.dati.nome || !this.dati.cognome || !this.dati.email) {
      this.messaggio = 'Nome, Cognome e Email sono obbligatori.';
      this.stato = 'errore';
      return;
    }

    this.stato = 'caricamento';
    this.messaggio = '';

    this.registraService.invitaVisitatore(this.dati).subscribe({
      next: (res) => {
        this.stato = 'successo';
        this.messaggio = 'Visitatore invitato con successo! QR code generato e inviato via mail.';
        // Reset form
        this.dati = { nome: '', cognome: '', dataNascita: '', email: '' };
      },
      error: (err) => {
        console.error("Errore durante l'invito:", err);
        this.stato = 'errore';
        this.messaggio = err.error?.message || 'Si è verificato un errore durante la registrazione.';
      }
    });
  }
}
