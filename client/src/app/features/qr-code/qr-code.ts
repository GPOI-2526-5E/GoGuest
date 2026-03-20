import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qr-code',
  imports: [CommonModule, RouterLink, ZXingScannerModule],
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
  standalone: true
})
export class QrCode {
  // Variabile per salvare il risultato della scansione
  scannedResult: string | null = null;

  // Variabili per gestire il lettore USB (emulazione tastiera)
  private barcodeBuffer: string = '';
  private typingTimer: any;

  // 1. GESTIONE FOTOCAMERA
  // Questo metodo viene chiamato quando la fotocamera legge un QR con successo
  onCodeResult(resultString: string) {
    this.processQrCode(resultString);
  }

  // 2. GESTIONE LETTORE USB
  // Questo 'decoratore' ascolta tutto ciò che viene digitato sulla tastiera
  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Se il tasto premuto è "Invio", significa che il lettore USB ha finito di leggere
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processQrCode(this.barcodeBuffer);
        this.barcodeBuffer = ''; // Svuotiamo il buffer dopo la lettura
      }
      return;
    }

    // Aggiungiamo il carattere digitato al nostro buffer
    this.barcodeBuffer += event.key;

    // I lettori USB digitano molto velocemente (pochi millisecondi tra un tasto e l'altro).
    // Se passa troppo tempo (es. 100ms), significa che è un umano a digitare, quindi cancelliamo.
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.barcodeBuffer = '';
    }, 100); 
  }

  // 3. ELABORAZIONE FINALE
  // Questo metodo unificato gestisce il risultato, indipendentemente da dove provenga
  processQrCode(code: string) {
    console.log('Codice QR Scansionato:', code);
    this.scannedResult = code;
    // Qui in futuro potrai aggiungere la logica per inviare il codice al tuo server
  }
}
