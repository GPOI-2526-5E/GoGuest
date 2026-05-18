import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  User as FirebaseUser
} from 'firebase/auth';
import { firebaseConfig } from '../../environments/firebase.config';

export const AUTH_TOKEN_STORAGE_KEY = 'goguest_dashboard_token';
const AUTH_USER_STORAGE_KEY = 'goguest_dashboard_user';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nome: string;
    cognome: string;
    role: string | null;
  };
}

interface DashboardUser {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  role: string | null;
  displayName: string;
  photoURL: null;
}

type AuthenticatedUser = FirebaseUser | DashboardUser;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/login';

  // Inizializza Firebase una sola volta
  private app: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

  private auth = getAuth(this.app);

  // Signal con l'utente corrente (null = non autenticato)
  currentUser = signal<AuthenticatedUser | null>(null);
  isLoggedIn  = signal(false);
  isLoading   = signal(true);

  constructor() {
    this.restoreJwtSession();

    // Ascolta i cambiamenti di stato dell'autenticazione
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } else {
        this.restoreJwtSession();
      }

      this.isLoading.set(false);
    });
  }

  /** Login con username/e-mail e password salvati nella tabella utente */
  async loginWithCredentials(identifier: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(this.apiUrl, { email: identifier, password })
    );

    const user = this.toDashboardUser(response.user);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);

    await this.router.navigate(['/dashboard']);
  }
  
  /** Registra un nuovo utente */
  async register(nome: string, cognome: string, email: string, password: string): Promise<void> {
    const url = 'http://localhost:3001/api/register';
    await firstValueFrom(
      this.http.post(url, { nome, cognome, email, password })
    );
  }



  /** Invia email per recupero password */
  async forgotPassword(email: string): Promise<void> {
    const url = 'http://localhost:3001/api/forgot-password';
    await firstValueFrom(this.http.post(url, { email }));
  }

  /** Reimposta la password usando il token */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const url = 'http://localhost:3001/api/reset-password';
    await firstValueFrom(this.http.post(url, { token, newPassword }));
  }

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
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);

    if (this.auth.currentUser) {
      await signOut(this.auth);
    }

    await this.router.navigate(['/login']);
  }

  hasJwtSession(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) && !!localStorage.getItem(AUTH_USER_STORAGE_KEY);
  }

  /** Restituisce il nome/email dell'utente corrente */
  get userDisplayName(): string {
    return this.currentUser()?.displayName ?? this.currentUser()?.email ?? 'Utente';
  }

  get userPhotoUrl(): string | null {
    return this.currentUser()?.photoURL ?? null;
  }

  /** True se l'utente ha ruolo admin */
  get isAdmin(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    // DashboardUser ha 'role', FirebaseUser non ce l'ha
    return (user as any)['role'] === 'admin';
  }

  private restoreJwtSession(): void {
    const user = this.getStoredUser();

    this.currentUser.set(user);
    this.isLoggedIn.set(!!user);
  }

  private getStoredUser(): DashboardUser | null {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!rawUser || !token) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as DashboardUser;
    } catch {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }
  }

  private toDashboardUser(user: LoginResponse['user']): DashboardUser {
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      cognome: user.cognome,
      role: user.role,
      displayName: `${user.nome} ${user.cognome}`.trim(),
      photoURL: null
    };
  }

}
