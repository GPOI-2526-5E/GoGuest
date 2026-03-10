import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-entry-form.component',
  imports: [CommonModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css',
  standalone: true,
})
export class EntryFormComponent {

  currentTime$: Observable<Date> = timer(0, 1000).pipe(
      map(() => new Date())
    );

}
