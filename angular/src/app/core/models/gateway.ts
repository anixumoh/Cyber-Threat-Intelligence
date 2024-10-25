import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';
import { Injectable } from '@angular/core';

@Injectable()
export class Gateway {
  constructor(private http: HttpUtilsService) {}

  get({ url, apiId, options }: { url: string; apiId: string; options?: any }) {
    const buildOptions = {
      apiId,
      url,
      requestType: 'GET',
    };
    return this.http.post(`${path}/gateway?notcache=${new Date().getTime()}`, buildOptions, options, true);
  }

  options({ url, apiId }: { url: string; apiId: string }) {
    const options = {
      apiId,
      url,
      requestType: 'OPTIONS',
    };
    return this.request(options);
  }

  post({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const options = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: data,
    };
    return this.request(options);
  }

  postImage({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const requestOptions = new RequestOptions({});
    requestOptions.responseType = 'text';

    const options = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: data,
    };

    return this.http.post(`${path}/gateway`, options, requestOptions).pipe();
  }

  download({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const options = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: data,
    };
    const requestOptions = new RequestOptions({});
    requestOptions.responseType = 'blob';
    return this.http.post(`${path}/gateway`, options, requestOptions).pipe();
  }

  put({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const options = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'PUT',
      entity: data,
    };
    return this.request(options);
  }

  patch({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const options = {
      apiId,
      url,
      consume: 'APPLICATION_JSON',
      requestType: 'PATCH',
      entity: data,
    };
    return this.request(options);
  }

  delete({ url, apiId, data }: { url: string; apiId: string; data: any }) {
    const options = {
      apiId,
      url,
      requestType: 'DELETE',
      entity: data,
    };
    return this.request(options);
  }

  request(body) {
    return this.http.post(`${path}/gateway`, body);
  }
}
