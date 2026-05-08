import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElencoVisiteService, Visita, Periodo } from './elenco-visite.service';

@Component({
  selector: 'app-elenco-visite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './elenco-visite.component.html',
  styleUrl: './elenco-visite.component.css'
})
export class ElencoVisiteComponent implements OnInit {

  periodo: Periodo = 'oggi';
  visite: Visita[] = [];
  isLoading = false;
  error: string | null = null;

  readonly periodoOptions: { value: Periodo; label: string }[] = [
    { value: 'oggi',  label: 'Visite Odierne' },
    { value: 'mese',  label: 'Visite del Mese' },
    { value: 'anno',  label: 'Visite dell\'Anno' },
  ];

  constructor(private service: ElencoVisiteService) {}

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.isLoading = true;
    this.error = null;
    this.visite = [];

    this.service.getVisite(this.periodo).subscribe({
      next: (data) => {
        this.visite = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Impossibile caricare le visite. Verifica che il server sia in esecuzione.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onPeriodoChange(): void {
    this.carica();
  }

  formatData(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  get labelPeriodo(): string {
    return this.periodoOptions.find(o => o.value === this.periodo)?.label ?? '';
  }
}
