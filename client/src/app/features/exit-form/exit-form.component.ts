import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service'; 

@Component({
  selector: 'app-exit-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './exit-form.component.html',
  styleUrl: './exit-form.component.css',
  standalone: true
})
export class ExitFormComponent {

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
    dateOfBirth: new FormControl('', Validators.required), 
  });

  onSubmit() {
    if (this.exitForm.valid) {
      const firstName = this.exitForm.value.firstName || '';
      const lastName = this.exitForm.value.lastName || '';
      const dateOfBirth = this.exitForm.value.dateOfBirth || '';

      this.authService.getVisitatoreID(firstName, lastName, '', dateOfBirth).subscribe({
        
        next: (risposta: any) => {
          if (risposta.visitaAttiva === 1) {
            this.notificationService.mostra("Visitatore trovato. Procedi alla firma per uscire.", 'info');
            this.router.navigate(['/sign'], { 
              state: { 
                nome: firstName, 
                cognome: lastName, 
                sorgente: "exit", 
                isNuovoUtente: false 
              },
            });
          } else {
            this.notificationService.mostra(`Attenzione: ${firstName} ${lastName} risulta già essere uscito dall'azienda.`, 'info'); 
          }
        },
        
        error: (errore) => {
          this.notificationService.mostra("Attenzione: Nessun visitatore trovato con questi dati. Verifica di aver scritto bene.", 'error');
        }
        
      });

    } else {
      this.notificationService.mostra('Attenzione: Compila tutti i campi obbligatori per procedere.', 'error');
      this.exitForm.markAllAsTouched();
    }
  }
}