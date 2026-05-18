import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface GdprSettings {
  totalVisitors: number;
  totalDeletions: number;
  retentionDays: number;
  autoDelete: boolean;
}

export interface GdprVisitor {
  IdVisitatore: number;
  Nome: string;
  Cognome: string;
  Azienda: string | null;
  Email: string | null;
  Referente: string | null;
  DataOraIngresso: string | null;
  DataOraUscita: string | null;
}

@Component({
  selector: 'app-sicurezza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sicurezza.component.html',
  styleUrl: './sicurezza.component.css'
})
export class SicurezzaComponent implements OnInit {
  private http = inject(HttpClient);

  // Stats & Settings Signals
  totalVisitors = signal<number>(0);
  totalDeletions = signal<number>(0);
  retentionDays = signal<number>(90);
  autoDelete = signal<boolean>(false);

  // Visitors Signal
  visitors = signal<GdprVisitor[]>([]);
  selectedIds = signal<Set<number>>(new Set());

  // Search Filters Signals
  searchQuery = signal<string>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  // UI State Signals
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  private baseUrl = 'http://localhost:3001/api/gdpr';

  ngOnInit(): void {
    this.loadAllData();
  }

  async loadAllData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    try {
      await Promise.all([this.loadSettings(), this.loadVisitors()]);
    } catch (err) {
      this.errorMsg.set('Errore nel caricamento dei dati GDPR.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSettings(): Promise<void> {
    const data = await firstValueFrom(this.http.get<GdprSettings>(`${this.baseUrl}/settings`));
    this.totalVisitors.set(data.totalVisitors);
    this.totalDeletions.set(data.totalDeletions);
    this.retentionDays.set(data.retentionDays);
    this.autoDelete.set(data.autoDelete);
  }

  async loadVisitors(): Promise<void> {
    let params = `?cerca=${encodeURIComponent(this.searchQuery())}`;
    if (this.dateFrom()) params += `&dataDal=${this.dateFrom()}`;
    if (this.dateTo()) params += `&dataAl=${this.dateTo()}`;

    const data = await firstValueFrom(this.http.get<GdprVisitor[]>(`${this.baseUrl}/visitatori${params}`));
    this.visitors.set(data);
    this.selectedIds.set(new Set()); // Reset selections on reload
  }

  async saveSettings(): Promise<void> {
    this.isSaving.set(true);
    this.successMsg.set(null);
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/settings`, {
          retentionDays: this.retentionDays(),
          autoDelete: this.autoDelete()
        })
      );
      this.successMsg.set('Impostazioni di conservazione GDPR salvate con successo!');
      setTimeout(() => this.successMsg.set(null), 4000);
    } catch (err) {
      console.error(err);
      this.errorMsg.set('Impossibile salvare le impostazioni GDPR.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleAutoDelete(state: boolean): Promise<void> {
    this.autoDelete.set(state);
    await this.saveSettings();
  }

  async onRetentionDaysChange(days: number): Promise<void> {
    this.retentionDays.set(days);
    await this.saveSettings();
  }

  onSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.isLoading.set(true);
    this.loadVisitors()
      .catch(() => this.errorMsg.set('Errore durante la ricerca dei visitatori.'))
      .finally(() => this.isLoading.set(false));
  }

  // Row Selection logic
  toggleSelectAll(checked: boolean): void {
    const set = new Set<number>();
    if (checked) {
      this.visitors().forEach(v => set.add(v.IdVisitatore));
    }
    this.selectedIds.set(set);
  }

  toggleSelectRow(id: number, checked: boolean): void {
    const set = new Set<number>(this.selectedIds());
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    this.selectedIds.set(set);
  }

  isRowSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  isAllSelected(): boolean {
    const list = this.visitors();
    return list.length > 0 && this.selectedIds().size === list.length;
  }

  // Action logic
  async onDeleteSelected(): Promise<void> {
    const idsToDelete = Array.from(this.selectedIds());
    if (idsToDelete.length === 0) return;

    const confirmMsg = `Sei sicuro di voler eliminare in modo permanente i dati personali di ${idsToDelete.length} visitatori selezionati?\nL'operazione non è reversibile.`;
    if (!confirm(confirmMsg)) return;

    this.isLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.baseUrl}/delete`, { ids: idsToDelete }));
      this.successMsg.set(res.message || 'Eliminazione effettuata con successo.');
      setTimeout(() => this.successMsg.set(null), 4000);
      
      // Ricarica i dati
      await Promise.all([this.loadSettings(), this.loadVisitors()]);
    } catch (err) {
      console.error(err);
      this.errorMsg.set('Si è verificato un errore durante l\'eliminazione dei dati.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteIndividual(visitor: GdprVisitor): Promise<void> {
    const confirmMsg = `Sei sicuro di voler eliminare definitivamente i dati di "${visitor.Nome} ${visitor.Cognome}"?\nTutti i dati di check-in e QR Code associati verranno rimossi permanentemente.`;
    if (!confirm(confirmMsg)) return;

    this.isLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.baseUrl}/delete`, { ids: [visitor.IdVisitatore] }));
      this.successMsg.set(`Dati personali di ${visitor.Nome} ${visitor.Cognome} eliminati con successo.`);
      setTimeout(() => this.successMsg.set(null), 4000);

      // Ricarica i dati
      await Promise.all([this.loadSettings(), this.loadVisitors()]);
    } catch (err) {
      console.error(err);
      this.errorMsg.set('Errore durante l\'eliminazione individuale del visitatore.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
