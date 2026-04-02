import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Definiamo come deve essere fatto un messaggio
export interface NotificationMessage {
  testo: string;
  tipo: 'success' | 'error' | 'info'; // Successo (verde), Errore (rosso), Info (blu)
}

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  // Il Subject è un "canale di comunicazione" dove pubblicheremo i messaggi
  public notifica$ = new Subject<NotificationMessage | null>();

  mostra(testo: string, tipo: 'success' | 'error' | 'info' = 'info') {
    this.notifica$.next({ testo, tipo });
    
    setTimeout(() => {
      this.chiudi();
    }, 4000);
  }

  chiudi() {
    this.notifica$.next(null);
  }
}