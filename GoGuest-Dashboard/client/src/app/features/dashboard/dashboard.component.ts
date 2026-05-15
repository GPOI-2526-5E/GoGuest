import { Component, OnInit, signal, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, VisitatoriMensili } from '../../core/dashboard.service';
import { AuthService } from '../../core/auth.service';

interface StatCard {
  key: keyof DashboardStats;
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}

interface ChartItem extends VisitatoriMensili {
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [
    { key: 'visitatoriOggi', label: 'Visitatori oggi', value: '0', icon: 'VO', color: '#6d28d9', bg: '#ede9fe' },
    { key: 'ingressiAttivi', label: 'Ingressi attivi', value: '0', icon: 'IA', color: '#047857', bg: '#d1fae5' },
    { key: 'qrGenerati', label: 'QR generati', value: '0', icon: 'QR', color: '#0369a1', bg: '#e0f2fe' },
    { key: 'usciteRegistrate', label: 'Uscite registrate', value: '0', icon: 'UR', color: '#b91c1c', bg: '#fee2e2' },
  ];

  chartData: ChartItem[] = [];
  currentYear = new Date().getFullYear();
  isLoading = false;
  error: string | null = null;
  linePoints = '';
  areaPoints = '';

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {

    this.caricaDashboard();
  }

  caricaDashboard(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.aggiornaStats(data.stats);
        this.aggiornaGrafico(data.visitatoriMensili);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Impossibile caricare i dati dashboard. Verifica che il server sia in esecuzione.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  get hasMonthlyVisitors(): boolean {
    return this.chartData.some((item) => item.totale > 0);
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

  private aggiornaStats(stats: DashboardStats): void {
    this.stats = this.stats.map((card) => ({
      ...card,
      value: Number(stats[card.key] ?? 0).toLocaleString('it-IT')
    }));
  }

  private aggiornaGrafico(data: VisitatoriMensili[]): void {
    const max = Math.max(...data.map((item) => item.totale), 0);
    const left = 32;
    const right = 580;
    const top = 22;
    const bottom = 178;
    const width = right - left;
    const height = bottom - top;
    const divisor = Math.max(data.length - 1, 1);

    this.chartData = data.map((item, index) => ({
      ...item,
      x: left + (width / divisor) * index,
      y: max > 0 ? bottom - (item.totale / max) * height : bottom
    }));
    this.linePoints = this.chartData.map((item) => `${item.x},${item.y}`).join(' ');
    this.areaPoints = this.chartData.length
      ? `${left},${bottom} ${this.linePoints} ${this.chartData[this.chartData.length - 1].x},${bottom}`
      : '';
  }
}
