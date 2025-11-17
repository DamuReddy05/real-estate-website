import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface AuthRedirectState {
  role: 'admin' | 'customer';
  redirectPath: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly STATE_KEY = 'auth0_oauth_state';
  private readonly NONCE_KEY = 'auth0_oauth_nonce';
  private readonly PENDING_TOKEN_KEY = 'auth0_pending_id_token';
  private readonly PENDING_STATE_KEY = 'auth0_pending_state';

  private ensureConfig() {
    if (!environment.auth0?.domain || !environment.auth0?.clientId || !environment.auth0?.audience) {
      throw new Error('Auth0 environment variables are not configured');
    }
  }

  startLogin(role: 'admin' | 'customer', redirectPath = '/'): void {
    this.ensureConfig();
    const domain = environment.auth0.domain!;
    const clientId = environment.auth0.clientId!;
    const audience = environment.auth0.audience!;
    const connection = environment.auth0.connection || 'google-oauth2';

    const nonce = this.generateRandomId();
    const stateObj: AuthRedirectState = { role, redirectPath };
    const state = btoa(JSON.stringify(stateObj));

    sessionStorage.setItem(this.NONCE_KEY, nonce);
    sessionStorage.setItem(this.STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'id_token',
      scope: 'openid profile email',
      audience,
      redirect_uri: `${window.location.origin}/auth/callback`,
      connection,
      prompt: 'select_account',
      state,
      nonce
    });

    window.location.href = `https://${domain}/authorize?${params.toString()}`;
  }

  handleAuthCallback(): { idToken: string; state: AuthRedirectState } {
    this.ensureConfig();
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const params = new URLSearchParams(hash);

    const idToken = params.get('id_token');
    const stateParam = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      throw new Error(errorDescription || error);
    }

    if (!idToken || !stateParam) {
      throw new Error('Missing token or state from Auth0');
    }

    const storedState = sessionStorage.getItem(this.STATE_KEY);
    if (!storedState || storedState !== stateParam) {
      throw new Error('Invalid login state. Please try again.');
    }

    const storedNonce = sessionStorage.getItem(this.NONCE_KEY);
    const decodedToken = this.decodeToken(idToken);
    const tokenNonce = decodedToken?.nonce;
    if (!storedNonce || !tokenNonce || storedNonce !== tokenNonce) {
      throw new Error('Invalid login nonce. Please try again.');
    }

    const decodedState = JSON.parse(atob(stateParam)) as AuthRedirectState;

    sessionStorage.removeItem(this.STATE_KEY);
    sessionStorage.removeItem(this.NONCE_KEY);

    return { idToken, state: decodedState };
  }

  storePendingToken(token: string, state: AuthRedirectState): void {
    sessionStorage.setItem(this.PENDING_TOKEN_KEY, token);
    sessionStorage.setItem(this.PENDING_STATE_KEY, btoa(JSON.stringify(state)));
  }

  consumePendingToken(): { token: string; state: AuthRedirectState } | null {
    const token = sessionStorage.getItem(this.PENDING_TOKEN_KEY);
    const stateEncoded = sessionStorage.getItem(this.PENDING_STATE_KEY);
    if (!token || !stateEncoded) {
      return null;
    }
    sessionStorage.removeItem(this.PENDING_TOKEN_KEY);
    sessionStorage.removeItem(this.PENDING_STATE_KEY);
    return { token, state: JSON.parse(atob(stateEncoded)) as AuthRedirectState };
  }

  private generateRandomId(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (b) => ('00' + b.toString(16)).slice(-2)).join('');
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
