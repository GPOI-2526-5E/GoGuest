import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-code',
  imports: [CommonModule, RouterLink, ZXingScannerModule],
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
  standalone: true
})
export class QrCode {
  // Definiamo i formati accettati (QR Code in questo caso)
  allowedFormats = [BarcodeFormat.QR_CODE];

  // Variabile per mostrare il risultato a video
  scannedResult: string | null = null;

  // Variabili per il lettore USB
  private barcodeBuffer: string = '';
  private typingTimer: any;

  // Metodo chiamato quando la fotocamera inquadra un QR
  onCodeResult(resultString: string) {
    this.processQrCode(resultString);
  }

  // Gestione Lettore USB (Emulazione Tastiera)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Se premiamo Invio, il lettore ha finito la scansione
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processQrCode(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
      return;
    }

    // Evitiamo di aggiungere tasti di controllo come "Shift", "Control", ecc.
    if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }

    // Reset del buffer se l'utente scrive lentamente (non è un lettore barcode)
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.barcodeBuffer = '';
    }, 100);
  }

  // Logica finale comune
  processQrCode(code: string) {
    console.log('Codice ricevuto:', code);
    this.scannedResult = code;
    // Qui potrai aggiungere la chiamata al database/API
    alert('Codice rilevato: ' + code);
  }

  // Aggiungi questo metodo nella classe QrCode
  onHasDevices(has: boolean) {
    console.log('Dispositivi trovati:', has);
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    console.log('Telecamere disponibili:', devices);
  }

}