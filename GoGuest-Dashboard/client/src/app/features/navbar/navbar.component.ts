import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path?: string;
  icon: string;
  children?: NavItem[];
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

  navItems: NavItem[] = [
    {
      label: 'Gestione',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      path: '/dashboard',
    },
    {
      label: 'Visitatori',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      children: [
        { label: 'Elenco', path: '/visitors', icon: '' },
        { label: 'Registra', path: '/entry', icon: '' },
      ],
    },
    {
      label: 'QR Code',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`,
      children: [
        { label: 'Lettore', path: '/qr', icon: '' },
        { label: 'Genera QR', path: '/genera-qr', icon: '' },
      ],
    },
    {
      label: 'Report',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      path: '/report',
    },
    {
      label: 'Sicurezza',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      path: '/settings',
    },
  ];

  openGroups: Set<string> = new Set(['Visitatori']);

  constructor(private router: Router) {}

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  toggleGroup(label: string): void {
    if (this.openGroups.has(label)) {
      this.openGroups.delete(label);
    } else {
      this.openGroups.add(label);
    }
  }

  isGroupOpen(label: string): boolean {
    return this.openGroups.has(label);
  }

  isActive(path?: string): boolean {
    if (!path) return false;
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  isGroupActive(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some(c => this.isActive(c.path));
  }
}
