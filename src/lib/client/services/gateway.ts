import type { AxiosRequestConfig } from 'axios';
import Service from '.';

export default class GatewayService extends Service {
  get<T>(apiId: string, url: string, config?: AxiosRequestConfig) {
    const data = {
      apiId,
      url,
      requestType: 'GET'
    };
    return this.client.post<T>('/api/v2/gateway', data, config);
  }

  post<T>(apiId: string, url: string, payload: any = {}, config?: AxiosRequestConfig) {
    const data = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: payload
    };
    return this.client.post<T>('/api/v2/gateway', data, config);
  }

  postImage<T>(apiId: string, url: string, payload: any = {}) {
    const data = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: payload
    };
    return this.client.post<T>('/api/v2/gateway', data);
  }
}
