import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  currentTime$: Observable<Date> = timer(0, 1000).pipe(
    map(() => new Date())
  );

  showQrPrompt: boolean = false;

  constructor(private router: Router) {}

  handleAction(type: string): void {
    if (type === 'entrata') {
      this.showQrPrompt = true;
    }
  }

  goToQrCode(): void {
    this.router.navigate(['/qrcode']);
  }

  goToEntryForm(): void {
    this.router.navigate(['/entry']);
  }
}
