import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login.component/login.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('client');
}
