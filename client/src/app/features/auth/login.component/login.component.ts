import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  currentTime$: Observable<Date> = timer(0, 1000).pipe(
    map(() => new Date())
  );

  handleAction(type: string): void {
    console.log('Azione selezionata:', type);
  }
}
