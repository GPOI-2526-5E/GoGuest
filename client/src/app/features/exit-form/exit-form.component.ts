import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from '../../core/auth.service';
// AGGIUNTO: Importazione del service
import { NotificationService } from '../../core/notification.service'; 

@Component({
  selector: 'app-exit-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './exit-form.component.html',
  styleUrl: './exit-form.component.css',
  standalone: true
})
export class ExitFormComponent {

  // MODIFICATO: Aggiunto notificationService
  constructor(
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService 
  ){}

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

  exitForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required), 
  });

  onSubmit() {
    if (this.exitForm.valid) {
      console.log('Controllo nel database se il visitatore esiste...');

      const firstName = this.exitForm.value.firstName || '';
      const lastName = this.exitForm.value.lastName || '';

      // Chiamiamo il backend per vedere se l'utente è registrato.
      this.authService.getVisitatoreID(firstName, lastName, '').subscribe({
        
        next: (risposta: any) => {
          // MODIFICA: Controllo se il visitatore è effettivamente "dentro" l'azienda
          if (risposta.visitaAttiva === 1) {
            console.log(`Visitatore trovato ed è attualmente dentro (ID: ${risposta.id}). Procedo alla firma...`);
            
            this.router.navigate(['/sign'], { 
              state: { 
                nome: firstName, 
                cognome: lastName, 
                sorgente: "exit", 
                isNuovoUtente: false 
              },
            });
          } else {
            // Il visitatore esiste, ma è già uscito in precedenza
            console.log('Il visitatore risulta già essere fuori.');
            // MODIFICATO: Sostituito alert
            this.notificationService.mostra(`Attenzione: ${firstName} ${lastName} risulta già essere uscito dall'azienda. Non è necessaria un'altra firma.`, 'info'); 
          }
        },
        
        error: (errore) => {
          console.error('Visitatore non trovato nel database.', errore);
          // MODIFICATO: Sostituito alert
          this.notificationService.mostra("Attenzione: Nessun visitatore trovato con questo nome e cognome. Verifica di aver scritto bene.", 'error');
        }
        
      });

    } else {
      console.log('Attenzione: Il form non è compilato correttamente.');
      this.exitForm.markAllAsTouched();
    }
  }
}