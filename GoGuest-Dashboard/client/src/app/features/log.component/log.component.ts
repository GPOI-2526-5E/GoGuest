import { Component, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserActivityLog {
  creatoIl: string;
  ultimoLogin: string | null;
  promossoIl: string | null;
  promossoDaNome: string | null;
  invitiConteggio: number;
  promossiConteggio: number;
  ruolo: string;
}

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css',
})
export class LogComponent implements OnInit {
  private http = inject(HttpClient);

  @Output() close = new EventEmitter<void>();

  logData = signal<UserActivityLog | null>(null);
  isLoading = signal(true);
  errorMsg = signal<string | null>(null);

  private apiUrl = 'http://localhost:3001/api/utente/log';

  ngOnInit(): void {
    this.fetchUserLogs();
  }

  async fetchUserLogs(): Promise<void> {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    try {
      const data = await firstValueFrom(this.http.get<UserActivityLog>(this.apiUrl));
      this.logData.set(data);
    } catch (err: any) {
      console.error('Errore nel recupero dei log attività:', err);
      this.errorMsg.set('Impossibile caricare i log attività. Riprova più tardi.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
