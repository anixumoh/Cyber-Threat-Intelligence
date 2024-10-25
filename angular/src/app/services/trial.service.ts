import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUtilsService, path } from './http-utils.service';

@Injectable()
export class TrialService {
  private script: any = {
    loaded: false,
    src: 'https://www.success-software.biz/adintel/ss_adintel.js',
  };

  constructor(private httpUtils: HttpUtilsService) {}

  signup(user: any): Observable<any> {
    return this.httpUtils.post(`${path}/trial`, user);
  }

  emailConfirmation(token: string): Observable<any> {
    const options: any = { params: `token=${token}` };

    return this.httpUtils.post(`${path}/trial/confirm_email`, {}, options);
  }

  loadScript(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.script.loaded) {
        resolve({ loaded: true, status: 'Already Loaded' });
      } else {
        const script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.script.src;
        script.onload = () => {
          this.script.loaded = true;
          resolve({ loaded: true, status: 'Loaded' });
        };
        script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
        document.getElementsByTagName('body')[0].appendChild(script);
      }
    });
  }
}
