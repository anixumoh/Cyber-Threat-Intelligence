import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError, of, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { JSONSchema } from '@ngx-pwa/local-storage';
import { path } from 'app/services/http-utils.service';
import { LocalStorageService } from './store/local-store.service';
import { SvelteService } from './svelte.service';

export interface Token {
  token: string;
}

export const TokenSchema: JSONSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' }
  },
  required: ['token']
};

@Injectable()
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string;
  environment: string;
  error: string;
  token: string;
  currentUser: any;
  forced2FA = false;
  private credentials: any;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private svelteService: SvelteService
  ) {}

  // TODO: remove this method
  login(username: string, password: string, code?, logged = false): Observable<any> {
    const data = { username, password, ...(code ? { code } : {}) };
    // TODO: Remove localhost validation
    if (logged) {
      return of(true).pipe(tap(() => (this.isLoggedIn = true)));
    } else if (username && password && !logged) {
      const headers = new HttpHeaders({
        uirequest: 'true'
      });
      const options = { headers };
      return this.http.post<any>(`${path}/auth`, data, options).pipe(
        map((res) => {
          const response = res;
          if (response && response.token) {
            this.localStorageService.set('Bearer', response, TokenSchema).subscribe(() => {});
            this.token = response.token;
            this.isLoggedIn = true; // side-effect
            this.credentials = { user: username, password, ...(code ? { code } : {}) };
          } else {
            return null;
          }
          return response;
        })
      );
    } else {
      // means !username || !password && !logged
      this.error = 'Check username and password before sending them again';
      return throwError(this.error);
    }
  }

  saveLoginToken(token: string) {
    this.localStorageService.set('Bearer', {token}, TokenSchema).subscribe();
    this.isLoggedIn = true;
    this.token = token;
  }

  logout() {
    this.isLoggedIn = false;
    this.localStorageService.clear().subscribe();
    this.svelteService.safeSendEvent('logout');
  }

  isUserLoggedIn(): Observable<boolean> {
    return this.localStorageService.has('Bearer');
  }

  sendForEmailPassword(pathToSend, email) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${path}/user/forgot_password`;
    const data = {
      email,
      url: `${pathToSend}/renew-password`
    };
    return this.http.post(url, data, { headers });
  }

  isNotLicenseAccepted() {
    return this.currentUser && !this.currentUser.licenseAccepted;
  }

  getAuthTokenFromStore(): Observable<Token> {
    return this.localStorageService.get<Token>('Bearer', TokenSchema);
  }
}
