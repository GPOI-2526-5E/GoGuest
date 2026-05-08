import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/notification.service';
import { QrService } from '../../core/qr.service';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

type ScanMode = 'camera' | 'scanner' | 'manual';
type FlashColor = 'none' | 'green' | 'red' | 'yellow';
type FacingMode = 'environment' | 'user';

@Component({
  selector: 'app-qr-code',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
  standalone: true
})
export class QrCode implements OnInit, OnDestroy, AfterViewInit {

  // ─── State ────────────────────────────────────────────────
  action: string = 'entry';
  scanMode: ScanMode = 'camera';
  facingMode: FacingMode = 'environment';

  isPending: boolean = false;
  isProcessing: boolean = false;
  hasResult: boolean = false;
  isSuccess: boolean | undefined = undefined;

  isFlashOn: boolean = false;
  hasFlash: boolean = false;

  manualCode: string = '';
  isVisible: boolean = true;
  overlayVisible: boolean = true;

  flashColor: FlashColor = 'none';
  isBluetoothEnabled: boolean | null = null;

  // ─── Refs ─────────────────────────────────────────────────
  private scannerInstance: Html5Qrcode | null = null;
  private isTransitioning: boolean = false;
  private readonly containerId = 'qr-reader';

  // Bouncer (debounce for duplicate scans)
  private lastCode: string | null = null;
  private lastCodeTime: number = 0;

  // Flash border timeout
  private flashTimeout: any = null;

  // Bluetooth polling
  private bluetoothInterval: any = null;

  // USB Scanner buffer
  private barcodeBuffer: string = '';
  private typingTimer: any = null;

  @ViewChild('manualInput') manualInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private notificationService: NotificationService,
    private qrService: QrService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    const state = history.state;
    if (state?.action) {
      this.action = state.action;
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngAfterViewInit(): void {
    this.applyMode();
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    clearInterval(this.bluetoothInterval);
    clearTimeout(this.flashTimeout);
    clearTimeout(this.typingTimer);
    this.stopScanner();
  }

  // ─── Computed helpers ─────────────────────────────────────
  get useCamera(): boolean { return this.scanMode === 'camera'; }
  get useManual(): boolean { return this.scanMode === 'manual'; }
  get useScanner(): boolean { return this.scanMode === 'scanner'; }
  get isLoading(): boolean { return this.isPending || this.isProcessing; }
  get showLoading(): boolean { return this.isLoading && !this.hasResult; }

  get headingText(): string {
    if (this.showLoading) return 'VERIFICA IN CORSO';
    if (this.useCamera) return 'INQUADRA IL CODICE';
    if (this.useManual) return 'INSERIMENTO MANUALE';
    return 'PRONTO ALLA SCANSIONE';
  }

  get subText(): string {
    if (this.showLoading) return 'Verifica del talloncino...';
    if (this.useCamera) return 'Inquadra il codice in qualsiasi punto';
    if (this.useManual) return 'Digita il codice del talloncino';
    return 'Scansiona il QR code con lo scanner';
  }

  get borderColor(): string {
    if (this.showLoading) return '#68d391'; // green.400
    switch (this.flashColor) {
      case 'green': return '#68d391';
      case 'red': return '#fc8181';
      case 'yellow': return '#f6e05e';
      default: return 'rgba(255,255,255,0.2)';
    }
  }

  get boxShadow(): string {
    if (this.showLoading) return '0 0 40px rgba(72, 187, 120, 0.6)';
    switch (this.flashColor) {
      case 'green': return '0 0 40px rgba(72, 187, 120, 0.6)';
      case 'red': return '0 0 40px rgba(245, 101, 101, 0.6)';
      case 'yellow': return '0 0 40px rgba(236, 201, 75, 0.6)';
      default: return '0 0 60px rgba(0,0,0,0.4)';
    }
  }

  // ─── Visibility ───────────────────────────────────────────
  private onVisibilityChange = (): void => {
    const visible = document.visibilityState === 'visible';
    this.ngZone.run(() => {
      this.isVisible = visible;
      if (!visible) {
        this.isFlashOn = false;
        this.stopScanner();
      } else if (this.useCamera) {
        this.startScanner();
      }
      this.cdr.detectChanges();
    });
  };

  // ─── Mode switching ───────────────────────────────────────
  onModeChange(mode: ScanMode): void {
    if (this.showLoading) return;
    const prev = this.scanMode;
    this.scanMode = mode;
    this.isFlashOn = false;

    if (prev === 'camera') {
      this.stopScanner();
    }

    if (mode === 'scanner') {
      this.startBluetoothCheck();
    } else {
      this.stopBluetoothCheck();
    }

    if (mode === 'camera') {
      // Give DOM time to render #qr-reader before starting
      setTimeout(() => this.startScanner(), 200);
    }

    if (mode === 'manual') {
      setTimeout(() => this.manualInputRef?.nativeElement.focus(), 150);
    }

    this.cdr.detectChanges();
  }

  private applyMode(): void {
    if (this.useCamera) {
      setTimeout(() => this.startScanner(), 200);
    } else if (this.useScanner) {
      this.startBluetoothCheck();
    }
  }

  onClose(): void {
    this.stopScanner();
    this.router.navigate(['/home']);
  }

  // ─── QR Processing ────────────────────────────────────────
  processQrCode(code: string): void {
    if (this.isPending || this.hasResult) return;

    this.isPending = true;
    this.isProcessing = true;

    this.qrService.scanQr(code.trim(), this.action).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.hasResult = true;
          this.isSuccess = true;
          this.isPending = false;
          this.isProcessing = false;
          this.triggerFlash('green');
          this.notificationService.mostra(res.message, 'success');
          setTimeout(() => this.router.navigate(['/home']), 2500);
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          const errorMsg = err?.error?.message ?? 'Errore durante la scansione del QR Code.';
          this.hasResult = true;
          this.isSuccess = false;
          this.isPending = false;
          this.isProcessing = false;
          this.triggerFlash('red');
          this.notificationService.mostra(errorMsg, 'error');
          setTimeout(() => {
            this.hasResult = false;
            this.isSuccess = undefined;
            this.lastCode = null;
            this.cdr.detectChanges();
          }, 3000);
        });
      }
    });
  }

  // ─── Flash border ─────────────────────────────────────────
  private triggerFlash(color: 'green' | 'red' | 'yellow'): void {
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
    this.flashColor = color;
    this.flashTimeout = setTimeout(() => {
      this.flashColor = 'none';
      this.cdr.detectChanges();
    }, 600);
    this.cdr.detectChanges();
  }

  // ─── Camera lifecycle ─────────────────────────────────────
  private async startScanner(): Promise<void> {
    if (this.isTransitioning || !this.isVisible) return;
    this.isTransitioning = true;

    try {
      await this.stopScanner();
      await new Promise(r => setTimeout(r, 150));

      const container = document.getElementById(this.containerId);
      if (!container || !this.useCamera || this.useManual) return;

      const html5QrCode = new Html5Qrcode(this.containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      this.scannerInstance = html5QrCode;

      const config: any = {
        fps: 30,
        qrbox: undefined,
        aspectRatio: 1.0,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        videoConstraints: {
          facingMode: this.facingMode,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          exposureCompensation: -2.0
        }
      };

      await html5QrCode.start(
        { facingMode: this.facingMode },
        config,
        (decodedText: string) => {
          this.ngZone.run(() => {
            if (this.isPending || this.hasResult) {
              if (decodedText === this.lastCode) {
                this.lastCodeTime = Date.now();
                this.triggerFlash('yellow');
              }
              return;
            }

            if (decodedText === this.lastCode) {
              const elapsed = Date.now() - this.lastCodeTime;
              if (elapsed < 3000) {
                this.lastCodeTime = Date.now();
                this.triggerFlash('yellow');
                return;
              }
            }

            this.lastCode = decodedText;
            this.lastCodeTime = Date.now();
            this.processQrCode(decodedText);
          });
        },
        () => {}
      );

      // Detect torch capability
      try {
        const video = container.querySelector('video') as HTMLVideoElement;
        if (video?.srcObject) {
          const stream = video.srcObject as MediaStream;
          const track = stream.getVideoTracks()[0];
          const caps = (track as any).getCapabilities?.();
          this.ngZone.run(() => {
            this.hasFlash = !!(caps?.torch);
            this.cdr.detectChanges();
          });
        }
      } catch { this.hasFlash = false; }

    } catch (err) {
      console.error('Camera start failed:', err);
      this.ngZone.run(() => {
        if (this.useCamera && this.isVisible) {
          this.notificationService.mostra('Impossibile riprendere la fotocamera.', 'error');
          this.onModeChange('scanner');
        }
      });
    } finally {
      this.isTransitioning = false;
    }
  }

  private async stopScanner(): Promise<void> {
    const scanner = this.scannerInstance;
    this.scannerInstance = null;
    if (scanner?.isScanning) {
      try { await scanner.stop(); } catch { /* ignore */ }
    }
  }

  // ─── Camera controls ──────────────────────────────────────
  toggleCamera(): void {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.isFlashOn = false;
    this.stopScanner().then(() => setTimeout(() => this.startScanner(), 200));
  }

  async toggleFlash(): Promise<void> {
    const scanner = this.scannerInstance;
    if (!scanner?.isScanning) return;
    try {
      const newState = !this.isFlashOn;
      await (scanner as any).applyVideoConstraints({
        advanced: [
          { torch: newState },
          { exposureMode: 'continuous' },
          { exposureCompensation: -2.0 }
        ]
      } as any);
      this.isFlashOn = newState;
    } catch { console.warn('Flashlight not supported'); }
  }

  // ─── Manual input ─────────────────────────────────────────
  onManualSubmit(): void {
    if (!this.manualCode.trim()) return;
    this.processQrCode(this.manualCode.trim());
    this.manualCode = '';
  }

  onManualKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onManualSubmit();
  }

  // ─── USB/Bluetooth scanner (keyboard input) ───────────────
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Close on Escape
    if (event.key === 'Escape') { this.onClose(); return; }

    // Ignore when camera or manual mode active
    if (this.useCamera || this.useManual || this.isPending) return;

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processQrCode(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
      return;
    }

    if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => { this.barcodeBuffer = ''; }, 50);
  }

  // ─── Bluetooth check ──────────────────────────────────────
  private startBluetoothCheck(): void {
    this.checkBluetooth();
    this.bluetoothInterval = setInterval(() => this.checkBluetooth(), 3000);
  }

  private stopBluetoothCheck(): void {
    clearInterval(this.bluetoothInterval);
    this.bluetoothInterval = null;
  }

  private async checkBluetooth(): Promise<void> {
    if (!('bluetooth' in navigator)) {
      this.isBluetoothEnabled = false; return;
    }
    try {
      const available = await (navigator as any).bluetooth.getAvailability();
      this.ngZone.run(() => { this.isBluetoothEnabled = available; this.cdr.detectChanges(); });
    } catch {
      this.ngZone.run(() => { this.isBluetoothEnabled = false; this.cdr.detectChanges(); });
    }
  }
}