import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class FiltersService {
  constructor(private http: HttpUtilsService) {}

  getFilters(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/filter`, requestOptions).pipe(catchError((e) => this.handleError(e)));
  }

  getFilterId(id): Observable<any> {
    return this.http.get(`${path}/filter/${id}`).pipe(catchError((e) => this.handleError(e)));
  }

  create(data): Observable<any> {
    return this.http.post(`${path}/filter`, data).pipe(catchError((e) => this.handleError(e)));
  }

  edit(data): Observable<any> {
    return this.http.put(`${path}/filter`, data).pipe(catchError((e) => this.handleError(e)));
  }

  delete(data): Observable<any> {
    return this.http.delete(`${path}/filter/${data.id}`).pipe(catchError((e) => this.handleError(e)));
  }

  listOptions() {
    return this.http.get(`${path}/filter/lists`).pipe(catchError((e) => this.handleError(e)));
  }

  private handleError(error: Error | HttpErrorResponse): Observable<any> {
    let errorMessage = '';

    if (error instanceof HttpErrorResponse) {
      if (error.error && error.error.message) {
        errorMessage =
          error.error.message === 'error.filter_template_already_exists'
            ? 'There is another filter with that name'
            : 'There was an error saving the filter. Please try again.';
      } else {
        errorMessage = `${error.status} - ${error.message}`;
      }
      return throwError(errorMessage);
    }
  }
}
