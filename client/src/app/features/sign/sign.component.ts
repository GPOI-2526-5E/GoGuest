import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import SignaturePad from 'signature_pad';

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

  // @ViewChild recupera l'elemento <canvas #signatureCanvas> dall'HTML
  @ViewChild('signatureCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private signaturePad!: SignaturePad;

  nomeUtente: string = '';
  cognomeUtente: string = '';
  source: string = '';

  constructor(private router: Router) {
    const state = history.state;
    this.source = history.state.sorgente;

    if (state) {
      this.nomeUtente = state.nome || '';
      this.cognomeUtente = state.cognome || '';
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
    
    const base64Data = this.signaturePad.toDataURL('image/png');
    console.log("Pronto per il DB:", base64Data);
    
    // TODO: Chiama un tuo Service Angular per inviare "base64Data" al backend
    this.router.navigate(['/home']);
  }
}


