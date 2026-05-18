import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    // Rimuoviamo eventuali preferenze salvate per forzare il tema chiaro
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('theme');
    }
    this.applyTheme(false);
  }

  toggleTheme() {
    // Disabilitato per rimanere sempre in light mode
  }

  private applyTheme(isDark: boolean) {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark-theme');
    }
  }
}
