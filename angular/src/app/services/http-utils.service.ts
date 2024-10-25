import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, of as observableOf, Subject, throwError as observableThrowError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';
import { ErrorService } from 'app/error/error.service';
import { getExtensions } from 'app/utils/functions';
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

const isHTMLResponse = (r) => typeof r === 'string' && r.startsWith(`<!doctype html>`);

export const host = environment.host;
const basePath = '/v2';
const apiBasePath = '/api/v2';

export const path = host + basePath;
export const pathApiV2 = host + apiBasePath;

@Injectable()
export class HttpUtilsService {
  sessionError = '';
  semaphore = true;
  error: any;
  waitFor: Subject<any> = new Subject<any>();
  downloadFileBoolean = false;
  isDownloadingBlobFile = false;
  isDownloadingGateway = false;

  constructor(
    private auth: AuthService,
    private errorService: ErrorService,
    private http: HttpClient,
    private toastrService: ToastrService
  ) { }

  delete(url: string, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    return this.runCall(() => {
      return this.http.delete(url, opts);
    });
  }

  multipartFormPost(url: string, body?: any, opts: RequestOptions = new RequestOptions({})): Observable<any> {
    return this.auth.getAuthTokenFromStore().pipe(
      switchMap((authToken) => {
        opts.headers = new HttpHeaders({ skip: 'true' }).set('x-cookie', authToken.token).set('uirequest', 'true');
        return this.runCall(() => {
          return this.http.post(url, body, opts);
        });
      })
    );
  }

  post(url: string, body: any, opts = new RequestOptions({}), gateway?): Observable<Response> {
    if (opts && opts.responseType === 'blob') {
      this.isDownloadingBlobFile = true;

      if (gateway) {
        this.isDownloadingGateway = true;
      }
    }
    return this.runCall(() => {
      return this.http.post(url, body, opts);
    });
  }

  put(url: string, body: any, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    return this.runCall(() => {
      return this.http.put(url, body, opts);
    });
  }

  get(url: string, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    url = url.indexOf('?') > -1 ? url + '&notcache=' + new Date().getTime() : url + '?notcache=' + new Date().getTime();
    return this.runCall(() => {
      return this.http.get(url, opts);
    });
  }

  getFile(url: string, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    this.downloadFileBoolean = true;
    return this.runCall(() => {
      return this.http.get(url, opts);
    });
  }

  getFileImage(url: string, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    opts.responseType = 'blob';

    return this.runCall(() => {
      return this.http.get(url, opts);
    });
  }

  getFileBinary(url: string, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    opts.responseType = 'blob';

    return this.runCall(() => {
      return this.http.get(url, opts);
    });
  }

  patch(url: string, body: any, opts: RequestOptions = new RequestOptions({})): Observable<HttpResponse<any>> | any {
    return this.runCall(() => {
      return this.http.patch(url, body, opts);
    });
  }

  postCSV(url: string, body?: any) {
    return new Observable((observer) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.response) {
          const blob = new Blob([xhr.response], {
            type: 'application/vnd.ms-excel'
          });

          if (xhr.status === 200) {
            const dwldLink = document.createElement('a');
            const urlObject = URL.createObjectURL(blob);
            const isSafariBrowser =
              navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
            dwldLink.setAttribute('target', '_blank');
            dwldLink.setAttribute('href', urlObject);
            dwldLink.setAttribute('download', 'exportedExcel.xlsx');
            dwldLink.style.visibility = 'hidden';
            document.body.appendChild(dwldLink);
            dwldLink.click();
            document.body.removeChild(dwldLink);
          } else {
            this.toastrService.error('Something went wrong while trying to export selected resources.', 'Error');
          }
        }

        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const contentType = 'application/vnd.ms-excel';
            const blob = new Blob([xhr.response], { type: contentType });
          }
        }
      };
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/vnd.ms-excel');
      xhr.setRequestHeader('x-cookie', this.auth.token);
      xhr.responseType = 'blob';
      xhr.withCredentials = true;
      xhr.send(body);
    });
  }

  downloadFile(data, mime, title = '') {
    const blob = new Blob([data as any], { type: mime });
    const finalMime: string = getExtensions(mime);
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser =
      navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    dwldLink.setAttribute('target', '_blank');
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', title ? title : 'exportedFile' + finalMime);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  generateFileFromBinary(data, title) {
    FileSaver.saveAs(data, title);
  }

  downloadOctetFile(data, mime: string, filenameSha256: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const blob = new Blob([data as any], { type: mime });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filenameSha256;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  multipartRequest(
    url: string,
    formData: FormData,
    method: 'POST' | 'PUT',
    opts: RequestOptions = new RequestOptions({})
  ): Observable<any> {
    return this.auth.getAuthTokenFromStore().pipe(
      switchMap((authToken) => {
        opts.headers = new HttpHeaders({ skip: 'true' }).set('x-cookie', authToken.token).set('uirequest', 'true');
        return this.runCall(() => {
          return new Observable((observer) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            const now = () => new Date().getTime();
            const startedTime = now();
            const estimatedTime = (load, total) => (total - load) / (load / ((now() - startedTime) / 1000));

            xhr.withCredentials = true;

            xhr.onreadystatechange = () => {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                switch (xhr.status) {
                  case 0:
                    observer.error('Bad request');
                    break;
                  case 400:
                    observer.error({
                      status: xhr.status,
                      body: this.getErrorMessage(xhr)
                    });
                    break;
                  case 200:
                    observer.next(xhr.response);
                    observer.complete();
                    break;
                  case 202:
                    observer.complete();
                    break;
                  case 413:
                    observer.error('Should be lower than 2MB');
                    break;
                  case 405:
                    observer.error("Couldn't upload file. Please try again.");
                    break;
                  default:
                    observer.error(xhr.response);
                }
              }
            };

            xhr.upload.onprogress = (e) => {
              const response = new HttpResponse(
                new ResponseOptions({
                  body: '{"estimated": ' + estimatedTime(e.loaded, e.total) + '}'
                })
              );
              observer.next(response);
            };

            xhr.open(method, url, true);
            if (opts.headers) {
              (opts.headers as HttpHeaders).keys().forEach((element) => {
                xhr.setRequestHeader(element, (opts.headers as HttpHeaders).get(element));
              });
            }

            xhr.send(formData);
          });
        });
      })
    );
  }

  multipartRequestNoXhr(
    url: string,
    formData: FormData,
    method: 'POST' | 'PUT',
    opts: RequestOptions = new RequestOptions({})
  ): Observable<any> {
    return this.auth.getAuthTokenFromStore().pipe(
      switchMap((authToken) => {
        opts.headers = new HttpHeaders({ skip: 'true' }).set('x-cookie', authToken.token).set('uirequest', 'true');
        return this.runCall(() => {
          return this.http.post(url, formData, opts);
        });
      })
    );
  }

  postMultipartNoXhr(url: string, formData: FormData, opts: RequestOptions = new RequestOptions({})): Observable<any> {
    return this.multipartRequestNoXhr(url, formData, 'POST', opts);
  }

  postMultipart(url: string, formData: FormData, opts: RequestOptions = new RequestOptions({})): Observable<any> {
    return this.multipartRequest(url, formData, 'POST', opts);
  }

  putMultipart(url: string, formData: FormData, opts: RequestOptions = new RequestOptions({})): Observable<any> {
    return this.multipartRequest(url, formData, 'PUT', opts);
  }

  catchGenericError(data: Observable<Response>): Observable<HttpResponse<any>> | any {
    return this.errorService.manageError(data);
  }

  private runCall(callback: () => Observable<any>): Observable<HttpResponse<any>> | any {
    return callback().pipe(
      switchMap((r: any) => {
        if (this.isDownloadingBlobFile) {
          this.isDownloadingBlobFile = false;
          if (r && r['headers']) {
            const contentDispositionString = r.headers.get('content-disposition');
            if (contentDispositionString && !this.isDownloadingGateway) {
              const contentDisposition = parseCookie(contentDispositionString);
              return observableOf({ file: r._body, filename: contentDisposition.filename });
            }
          }
          this.isDownloadingGateway = false;
          return observableOf(r);
        }
        if (this.downloadFileBoolean) {
          this.downloadFileBoolean = !this.downloadFileBoolean;
          return observableOf(r._body);
        } else {
          if (r?.headers) {
            const contentType = r.headers.get('content-type');
            if (contentType && contentType.includes('application/octet-stream')) {
              return observableOf(r);
            }
          }

          return isHTMLResponse(r) ? observableThrowError(r) : observableOf(r);
        }
      }),
      switchMap((r) => {
        return r?.error && (typeof r.error === 'string' || (Array.isArray(r.error) && !!r.error.length))
          ? this.catchGenericError(r?.error)
          : observableOf(r);
      })
    );
  }

  private getErrorMessage(error) {
    const res = error.response;
    const err = JSON.parse(res);
    let message = 'Bad request';
    switch (err.message) {
      case 'error.empty_file':
        message = 'The file is empty.';
        break;
      case 'malware.max_file_size':
        message = 'File size cannot exceed 20MB.';
        break;
      case 'error.file_type_not_accepted':
        message = 'File type is not accepted. Please refer to the info button to see a list of accepted formats.';
        break;
      case 'malware.already_uploaded':
        message = 'File was already uploaded';
        break;
      case 'error.invalid_url':
        message = 'Invalid url.';
        break;
      case 'error.undefined_error':
        message = 'There was a problem uploading the malware.';
        break;
      case 'malware.upload_error':
        message = 'We have not been able to process the sample you have provided.';
        break;
      case 'error.invalid_file_extension':
        message = 'Invalid file extension';
        break;
    }
    return message;
  }
}

export class RequestOptions {
  method?: any;
  headers?: HttpHeaders | { [header: string]: string | string[] };
  body?: any;
  url?: any;
  search?: any;
  params?: HttpParams | { [param: string]: string | string[] };
  observe?: any;
  reportProgress?: boolean;
  responseType?: any;
  withCredentials?: boolean;
  constructor(opts?: any) { }
}

export class ResponseOptions {
  body?: any;
  status?: any;
  headers?: any;
  url?: any;
  constructor(opts?: any) { }
}

const parseCookie = (str) =>
  str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      if (v[1]) {
        const value = v[1].replace(/^"(.+(?="$))"$/, '$1');
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(value.trim());
      }
      return acc;
    }, {});
