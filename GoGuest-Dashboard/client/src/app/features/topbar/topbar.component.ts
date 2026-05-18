import { Component, signal, inject, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  isMenuOpen = signal(false);
  isDark = computed(() => this.themeService.isDark());

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Signal per l'URL corrente
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Titolo della pagina basato sull'URL
  pageTitle = computed(() => {
    const url = this.currentUrl() || '/dashboard';
    if (url.includes('profile')) return 'Profilo';
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('elenco-visite')) return 'Elenco Visite';
    if (url.includes('entry')) return 'Registra Visitatore';
    if (url.includes('qr')) return 'Lettore QR';
    if (url.includes('genera-qr')) return 'Genera QR';
    if (url.includes('report')) return 'Report Vendite';
    if (url.includes('settings')) return 'Sicurezza';
    if (url.includes('promuovi')) return 'Gestione Ruoli';
    return 'Dashboard';
  });


  get userDisplayName() {
    return this.authService.userDisplayName;
  }

  get userInitials(): string {
    const displayName = this.authService.userDisplayName.trim();
    const source = displayName.includes('@') ? displayName.split('@')[0] : displayName;
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase() || 'UT';
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar-right')) {
      this.isMenuOpen.set(false);
    }
  }

  goToProfile() {
    this.isMenuOpen.set(false);
    this.router.navigate(['/profile']);
  }

  async onLogout() {
    await this.authService.logout();
  }
}
