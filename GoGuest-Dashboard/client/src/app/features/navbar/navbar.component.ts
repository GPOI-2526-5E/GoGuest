import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/auth.service';

interface NavItem {
  label: string;
  path?: string;
  icon: SafeHtml;
  adminOnly?: boolean;
  children?: { label: string; path: string }[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  collapsed = false;
  openGroups: Set<string> = new Set();

  private authService = inject(AuthService);

  navItems: NavItem[];

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    const s = (html: string): SafeHtml =>
      this.sanitizer.bypassSecurityTrustHtml(html);

    this.navItems = [
      {
        label: 'Gestione',
        path: '/dashboard',
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`),
      },
      {
        label: 'Visitatori',
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`),
        children: [
          { label: 'Elenco',    path: '/elenco-visite' },
          { label: 'Registra',  path: '/entry' },
        ],
      },
      {
        label: 'Elenco QR',
        path: '/elenco-visite',
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`),
      },
      {
        label: 'Vendite',
        path: '/report',
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`),
      },
      {
        label: 'Sicurezza',
        path: '/settings',
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`),
      },
      {
        label: 'Ruoli',
        path: '/promuovi',
        adminOnly: true,
        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`),
      },
    ];
  }

  /** Voci visibili in base al ruolo corrente */
  get visibleNavItems(): NavItem[] {
    const isAdmin = this.authService.isAdmin;
    return this.navItems.filter(item => !item.adminOnly || isAdmin);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  toggleGroup(label: string): void {
    this.openGroups.has(label)
      ? this.openGroups.delete(label)
      : this.openGroups.add(label);
  }

  isGroupOpen(label: string): boolean {
    return this.openGroups.has(label);
  }

  isActive(path?: string): boolean {
    if (!path) return false;
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  isGroupActive(item: NavItem): boolean {
    return item.children?.some(c => this.isActive(c.path)) ?? false;
  }

  chevronSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
    );
  }

  collapseSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
    );
  }
}
