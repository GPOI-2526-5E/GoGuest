import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  onEmailChange(value: string) {
    this.email.set(value);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  onLogin() {
    this.errorMessage.set('');

    if (!this.email() || !this.password()) {
      this.errorMessage.set('Inserisci email e password.');
      return;
    }

    this.isLoading.set(true);

    // TODO: Implement real login logic
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Login attempt:', this.email());
    }, 1500);
  }

  onGoogleLogin() {
    this.isLoading.set(true);
    // TODO: Implement Google OAuth login
    console.log('Google login initiated');
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  onForgotPassword() {
    // TODO: Navigate to forgot password page
    console.log('Forgot password clicked');
  }

  onCreateAccount() {
    // TODO: Navigate to registration page
    console.log('Create account clicked');
  }
}
