import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 

@Component({
  selector: 'app-entry-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css',
  standalone: true,
})
export class EntryFormComponent {

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

    // 1. CREIAMO IL MODELLO DEL FORM
  // Ogni campo corrisponde a un input nel tuo HTML
  entryForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    referent: new FormControl('', Validators.required),
    // Per la privacy, verifichiamo che sia obbligatoriamente "true" (spuntata)
    privacyConsent: new FormControl(false, Validators.requiredTrue) 
  });

  // 2. FUNZIONE CHE SI ATTIVA AL CLICK DEL PULSANTE
  onSubmit() {
    // Controlliamo se tutti i campi richiesti sono stati compilati
    if (this.entryForm.valid) {
      // Se è valido, stampiamo i dati nella console del browser!
      console.log('Dati pronti per il database:', this.entryForm.value);
      
      // Qui, in futuro, scriveremo il codice per inviare i dati al server/database

      /*
      TO DO
      */

    } else {
      console.log('Attenzione: Il form non è compilato correttamente.');
      // Angular evidenzierà automaticamente in rosso i campi mancanti se impostiamo il CSS
    }
  }
}
