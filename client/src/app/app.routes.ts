import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component/login.component';
import { EntryFormComponent } from './features/auth/entry-form.component/entry-form.component';
import { SignComponent } from './features/sign.component/sign.component';

export const routes: Routes = [
    //Route di default che manda a /home
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: LoginComponent },
    //Route per form di entrata
    { path: 'entry', component: EntryFormComponent }, 
    //Route per form di uscita
    //{ path: 'entry', component: ExitFormComponent }, 
    //Route per lettore di qrcode
    //{ path: 'entry', component: QrCodeComponent }, 
    
    // route per la firma
    { path: 'sign', component: SignComponent }, 
];
