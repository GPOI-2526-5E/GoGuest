import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

interface Dipendente {
  IdUtente: number;
  Nome: string;
  Cognome: string;
  Email: string;
  Ruolo: string;
}

@Component({
  selector: 'app-promuovi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promuovi.component.html',
  styleUrl: './promuovi.component.css'
})
export class PromuoviComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  dipendenti = signal<Dipendente[]>([]);
  isLoading = signal(true);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  promotingId = signal<number | null>(null);

  private apiUrl = 'http://localhost:3001/api';

  ngOnInit(): void {
    if (!this.authService.isAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadDipendenti();
  }

  async loadDipendenti(): Promise<void> {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<Dipendente[]>(`${this.apiUrl}/utenti`)
      );
      this.dipendenti.set(data);
    } catch {
      this.errorMsg.set('Errore nel caricamento degli utenti.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async promuovi(dipendente: Dipendente): Promise<void> {
    this.promotingId.set(dipendente.IdUtente);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/utenti/${dipendente.IdUtente}/promuovi`, {})
      );
      this.successMsg.set(`${dipendente.Nome} ${dipendente.Cognome} è stato promosso ad amministratore!`);
      // Rimuovi dalla lista locale
      this.dipendenti.update(list => list.filter(d => d.IdUtente !== dipendente.IdUtente));
    } catch {
      this.errorMsg.set('Errore durante la promozione. Riprova.');
    } finally {
      this.promotingId.set(null);
      // Nascondi il messaggio dopo 4 secondi
      setTimeout(() => this.successMsg.set(null), 4000);
    }
  }
}
