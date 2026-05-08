import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  stats = [
    { label: 'Visitatori oggi',    value: '0',  icon: '👥', color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Ingressi attivi',    value: '0',  icon: '🟢', color: '#059669', bg: '#d1fae5' },
    { label: 'QR generati',        value: '0',  icon: '📷', color: '#0284c7', bg: '#e0f2fe' },
    { label: 'Uscite registrate',  value: '0',  icon: '🔴', color: '#dc2626', bg: '#fee2e2' },
  ];
}
