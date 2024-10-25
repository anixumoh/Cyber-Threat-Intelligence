import { Injectable } from '@angular/core';
import { Gateway } from './gateway';

const apiId = 'GLADOS';

@Injectable()
export class GladosGateway {
  constructor(private gateway: Gateway) {}

  post({ url, data }: { url: string; data: any }) {
    return this.gateway.post({ url, apiId, data });
  }

  get({ url }: { url: string; options?: any }) {
    return this.gateway.get({ url, apiId });
  }

  private getUrl(url, api = '/api/v1') {
    return /^http/.test(url) ? url : `${api}${url}`;
  }
}
