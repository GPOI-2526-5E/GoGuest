import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from '../../core/auth.service'; 

@Component({
  selector: 'app-entry-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css',
  standalone: true,
})
export class EntryFormComponent {

  constructor(private router: Router, private authService: AuthService){}

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

  entryForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    referent: new FormControl('', Validators.required),
    privacyConsent: new FormControl(false, Validators.requiredTrue) 
  });

  onSubmit() {
    if (this.entryForm.valid) {
      console.log('Dati pronti per il database:', this.entryForm.value);

      const firstName = this.entryForm.value.firstName || '';
      const lastName = this.entryForm.value.lastName || '';
      const companyName = this.entryForm.value.company || '';
      
      this.authService.getVisitatoreID(firstName, lastName, companyName).subscribe({
        
        next: (risposta: any) => {
          console.log(`Visitatore trovato! È un utente di ritorno con ID: ${risposta.id}`);
          
          this.router.navigate(['/sign'], { 
            state: { nome: firstName, cognome: lastName, sorgente: "entry", azienda: companyName, isNuovoUtente: false }
          });
        },
        
        error: (errore) => {
          console.log('UTENTE NUOVO');
          
          this.router.navigate(['/sign'], { 
            state: { nome: firstName, cognome: lastName, sorgente: "entry", azienda: companyName, isNuovoUtente: true }
          });
        }
        
      });

    } else {
      console.log('Attenzione: Il form non è compilato correttamente.');
      this.entryForm.markAllAsTouched();
    }
  }
}