import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    // Recupera il token dall'URL (?token=...)
    const t = this.route.snapshot.queryParamMap.get('token');
    if (!t) {
      this.errorMessage.set('Token mancante o non valido.');
    } else {
      this.token.set(t);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  onConfirmPasswordChange(value: string) {
    this.confirmPassword.set(value);
  }

  async onReset() {
    this.errorMessage.set('');
    this.successMessage.set('');

    const pass = this.password();
    const confirm = this.confirmPassword();

    if (!pass || !confirm) {
      this.errorMessage.set('Inserisci la nuova password.');
      return;
    }

    if (pass !== confirm) {
      this.errorMessage.set('Le password non corrispondono.');
      return;
    }

    // Validazione complessità
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(pass)) {
      this.errorMessage.set('La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.resetPassword(this.token(), pass);
      this.successMessage.set('Password reimpostata con successo! Ora puoi accedere.');
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);

    } catch (err: any) {
      this.errorMessage.set('Token scaduto o non valido. Richiedi un nuovo link.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}
