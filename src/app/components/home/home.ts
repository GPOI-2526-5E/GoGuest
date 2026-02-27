import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})

export class Home {
  currentTime$: Observable<Date> = timer(0, 1000).pipe( map(() => new Date()) ); 
  handleAction(type: string): void { 
    console.log('Azione selezionata:', type); 
  }
}

