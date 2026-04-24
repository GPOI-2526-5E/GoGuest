import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { NotificationService } from '../../core/notification.service';
import { QrService } from '../../core/qr.service';

@Component({
  selector: 'app-qr-code',
  imports: [CommonModule, RouterLink, ZXingScannerModule, RouterModule],
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
  standalone: true
})
export class QrCode {

  action: string = 'entry'; // Default fallback
  isProcessing: boolean = false;

  constructor(private notificationService: NotificationService, private qrService: QrService, private router: Router) {
    const state = history.state;
    if (state && state.action) {
      this.action = state.action;
    }
  }

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

  // L'HostListener ascolta l'intera finestra per la pressione dei tasti (pistola USB)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
    // La pistola preme sempre 'Enter' alla fine
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processQrCode(this.barcodeBuffer);
        this.barcodeBuffer = ''; // Svuoto il contenitore per il prossimo QR code
      }
      return;
    }

    // Evito di salvare tasti speciali come "Shift", "Control", ecc.
    if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }

    // Distinguo la pistola da un essere umano
    clearTimeout(this.typingTimer);
    
    // Se passa più di 50 millisecondi, è un umano che digita quindi svuoto il buffer.
    this.typingTimer = setTimeout(() => {
      this.barcodeBuffer = '';
    }, 50); 
  }

  // Logica finale comune (sia da webcam che da pistola USB)
  processQrCode(code: string) {
    if (this.isProcessing) return; // Evita scansioni multiple
    
    this.isProcessing = true;
    console.log(`Codice ricevuto: ${code}, Azione: ${this.action}`);
    this.scannedResult = code;
    
    this.qrService.scanQr(code, this.action).subscribe({
      next: (res: any) => {
        this.notificationService.mostra(res.message, 'success');
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (err: any) => {
        const errorMsg = err.error && err.error.message ? err.error.message : 'Errore durante la scansione del QR Code.';
        this.notificationService.mostra(errorMsg, 'error');
        // Riabilita la scansione dopo un errore
        setTimeout(() => {
          this.isProcessing = false;
          this.scannedResult = null;
        }, 3000);
      }
    });
  }

  // Metodi per la gestione della fotocamera
  onHasDevices(has: boolean) {
    console.log('Dispositivi trovati:', has);
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    console.log('Telecamere disponibili:', devices);
  }
}