import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { LogComponent } from '../log.component/log.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LogComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  showLogModal = signal(false);

  user = computed(() => {
    return this.authService.currentUser() as any;
  });


  get userDisplayName() {
    return this.authService.userDisplayName;
  }

  get userInitials(): string {
    const displayName = this.userDisplayName.trim();
    const source = displayName.includes('@') ? displayName.split('@')[0] : displayName;
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase() || 'UT';
  }

  userRole = computed(() => {
    return this.authService.isAdmin ? 'Admin Dashboard' : 'Lavoratore';
  });

  // Esempio di dati "fantasiosi" reattivi
  stats = computed(() => {
    const isAccessAdmin = this.authService.isAdmin;
    return [
      { label: 'Livello Accesso', value: isAccessAdmin ? 'Amministratore' : 'Lavoratore', icon: isAccessAdmin ? '🔑' : '🧭' },
      { label: 'Stato Account', value: 'Attivo', icon: '🛡️' },
      { label: 'Ultima Attività', value: 'Oggi', icon: '🕒' }
    ];
  });
}
