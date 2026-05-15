import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);


  email = signal('');
  password = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  onEmailChange(value: string) {
    this.email.set(value);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  async onLogin() {
    this.errorMessage.set('');
    const identifier = this.email().trim();
    const password = this.password();

    if (!identifier || !password) {
      this.errorMessage.set('Inserisci email e password.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.loginWithCredentials(identifier, password);
    } catch (err: any) {
      const msg = err?.status === 401
        ? 'Credenziali non valide.'
        : err?.error?.message ?? 'Errore durante il login. Riprova.';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Login Google via Firebase
  async onGoogleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      const msg = err?.code === 'auth/popup-closed-by-user'
        ? 'Popup chiuso. Riprova.'
        : 'Errore durante il login con Google. Riprova.';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onForgotPassword() {
    this.errorMessage.set('');
    this.successMessage.set('');
    const mail = this.email().trim();

    if (!mail) {
      this.errorMessage.set('Inserisci la tua e-mail per recuperare la password.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.forgotPassword(mail);
      this.successMessage.set('Email di ripristino inviata! Controlla la tua posta.');
    } catch (err: any) {
      this.errorMessage.set('Errore durante l\'invio dell\'email. Riprova.');
    } finally {
      this.isLoading.set(false);
    }
  }


  onCreateAccount() {
    this.router.navigate(['/registrazione']);
  }

}
