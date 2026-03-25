import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { EntryFormComponent } from './features/entry-form/entry-form.component';
import { ExitFormComponent } from './features/exit-form/exit-form.component';
import { SignComponent } from './features/sign/sign.component';
import { QrCode } from './features/qr-code/qr-code';

export const routes: Routes = [
    //Route di default che manda a /home
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: LoginComponent },
    //Route per form di entrata
    { path: 'entry', component: EntryFormComponent }, 
    //Route per form di uscita
    { path: 'exit', component: ExitFormComponent }, 
    //Route per lettore di qrcode
    { path: 'qrcode', component: QrCode }, 
    // route per la firma
    { path: 'sign', component: SignComponent }, 
];
