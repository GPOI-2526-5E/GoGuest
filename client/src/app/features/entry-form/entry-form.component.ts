import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from '../../core/auth.service'; 
import { NotificationService } from '../../core/notification.service'; 

@Component({
  selector: 'app-entry-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css',
  standalone: true,
})
export class EntryFormComponent {

  constructor(
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService
  ){}

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

  entryForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    referent: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required), 
    privacyConsent: new FormControl(false, Validators.requiredTrue) 
  });

  onSubmit() {
    if (this.entryForm.valid) {
      const firstName = this.entryForm.value.firstName || '';
      const lastName = this.entryForm.value.lastName || '';
      const companyName = this.entryForm.value.company || '';
      const dateOfBirthValue = this.entryForm.value.dateOfBirth || '';
      
      this.authService.getVisitatoreID(firstName, lastName, companyName, dateOfBirthValue).subscribe({
        
        next: (risposta: any) => {
          // CONTROLLO se l'utente è già all'interno dell'azienda
          if (risposta.visitaAttiva === 1) {
            this.notificationService.mostra(`Attenzione: ${firstName} ${lastName} risulta già all'interno dell'azienda.`, 'error');
            this.router.navigate(['/home']);
          } else {
            this.notificationService.mostra("Bentornato! Procedi con la firma per entrare.", 'info');
            this.router.navigate(['/sign'], { 
              state: { 
                nome: firstName, 
                cognome: lastName, 
                azienda: companyName,
                dataNascita: dateOfBirthValue, 
                sorgente: "entry", 
                isNuovoUtente: false 
              }
            });
          }
        },
        
        error: (errore) => {
          this.notificationService.mostra("Dati validi. Procedi con la firma per completare la registrazione.", 'success');
          
          this.router.navigate(['/sign'], { 
            state: { 
              nome: firstName, 
              cognome: lastName, 
              azienda: companyName,
              dataNascita: dateOfBirthValue, 
              sorgente: "entry", 
              isNuovoUtente: true 
            }
          });
        }
        
      });

    } else {
      this.notificationService.mostra('Attenzione: Compila tutti i campi obbligatori per procedere.', 'error');
      this.entryForm.markAllAsTouched();
    }
  }
}