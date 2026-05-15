import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private authService = inject(AuthService);

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

  // Esempio di dati "fantasiosi"
  stats = [
    { label: 'Livello Accesso', value: 'Amministratore', icon: '🔑' },
    { label: 'Stato Account', value: 'Attivo', icon: '🛡️' },
    { label: 'Ultima Attività', value: 'Oggi', icon: '🕒' }
  ];
}
