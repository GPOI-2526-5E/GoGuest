import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-registrazione-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registrazione-login.component.html',
  styleUrl: './registrazione-login.component.css',
})
export class RegistrazioneLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  nome = signal('');
  cognome = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onNomeChange(value: string) {
    this.nome.set(value);
  }

  onCognomeChange(value: string) {
    this.cognome.set(value);
  }

  onEmailChange(value: string) {
    this.email.set(value);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  onConfirmPasswordChange(value: string) {
    this.confirmPassword.set(value);
  }

  async onRegister() {
    this.errorMessage.set('');
    this.successMessage.set('');

    const name = this.nome().trim();
    const surname = this.cognome().trim();
    const mail = this.email().trim();
    const pass = this.password();
    const confirm = this.confirmPassword();

    if (!name || !surname || !mail || !pass || !confirm) {
      this.errorMessage.set('Tutti i campi sono obbligatori.');
      return;
    }


    if (pass !== confirm) {
      this.errorMessage.set('Le password non corrispondono.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(pass)) {
      this.errorMessage.set('La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.');
      return;
    }


    this.isLoading.set(true);
    try {
      await this.authService.register(name, surname, mail, pass);

      this.successMessage.set('Registrazione completata! Reindirizzamento al login...');
      
      // Reindirizza al login dopo 2 secondi
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (err: any) {
      const msg = err?.status === 409 
        ? 'Email già esistente.' 
        : 'Errore durante la registrazione. Riprova.';

      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}

