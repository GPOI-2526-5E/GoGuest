import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp
} from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { firebaseConfig } from '../../environments/firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // Inizializza Firebase una sola volta
  private app: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

  private auth = getAuth(this.app);

  // Signal con l'utente corrente (null = non autenticato)
  currentUser = signal<User | null>(null);
  isLoggedIn  = signal(false);
  isLoading   = signal(true);

  constructor() {
    // Ascolta i cambiamenti di stato dell'autenticazione
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user);
      this.isLoading.set(false);
    });
  }

  /** Apre il popup Google per il login */
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(this.auth, provider);
    if (result.user) {
      await this.router.navigate(['/dashboard']);
    }
  }

  /** Disconnette l'utente e torna al login */
  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/login']);
  }

  /** Restituisce il nome/email dell'utente corrente */
  get userDisplayName(): string {
    return this.currentUser()?.displayName ?? this.currentUser()?.email ?? 'Utente';
  }

  get userPhotoUrl(): string | null {
    return this.currentUser()?.photoURL ?? null;
  }
}
