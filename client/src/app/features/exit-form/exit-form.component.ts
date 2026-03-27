import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; import { Component } from '@angular/core';

@Component({
  selector: 'app-exit-form.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './exit-form.component.html',
  styleUrl: './exit-form.component.css',
  standalone: true
})
export class ExitFormComponent {

  constructor(private router: Router){}

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

  exitForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required), 
  });

  onSubmit() {
    if (this.exitForm.valid) {
      console.log('Dati pronti per controllo della firma nel database:', this.exitForm.value);

      const firstName = this.exitForm.value.firstName;
      const lastName = this.exitForm.value.lastName;

      // Navighiamo verso /sign passando i dati nello "state"
      this.router.navigate(['/sign'], { 
        state: { nome: firstName, cognome: lastName, sorgente: "exit" },
      });
      
      // Qui, in futuro, scriveremo il codice per controllare i dati e la firma dal server/database

      /*
      TO DO
      */

    } else {
      console.log('Attenzione: Il form non è compilato correttamente.');
      this.exitForm.markAllAsTouched();
    }
  }
}


