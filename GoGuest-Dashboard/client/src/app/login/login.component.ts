import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  email        = signal('');
  password     = signal('');
  isLoading    = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  onEmailChange(value: string)    { this.email.set(value); }
  onPasswordChange(value: string) { this.password.set(value); }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  // Login email/password — da implementare in futuro
  onLogin() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Inserisci email e password.');
      return;
    }
    this.errorMessage.set('Login email/password non ancora implementato. Usa Google.');
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

  onForgotPassword() {
    // TODO: recupero password
    console.log('Forgot password');
  }

  onCreateAccount() {
    // TODO: registrazione
    console.log('Create account');
  }
}
