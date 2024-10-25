import { throwError, Subscription, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { OnDestroy, Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ErrorInterface } from 'app/error/error.model';

@Injectable()
export class ErrorService implements OnDestroy {
  isDetail: any;
  activeModule: any;
  activeOrganization: any;
  contextOservable: Subscription;

  errorState: ErrorInterface = {
    errorMessage: undefined,
    errorNavigationRute: undefined
  };

  errorSubject = new BehaviorSubject<any>(null);

  constructor(private router: Router, private ls: LocalStorageService) {}

  ngOnDestroy() {
    if (this.contextOservable) {
      this.contextOservable.unsubscribe();
    }
  }

  manageError(resp) {
    // if (typeof resp === 'string') {
    //   resp = JSON.parse(resp);
    // }
    const status = resp && resp.status;
    switch (status) {
      case 400:
        return this.c_400(resp);
      // case 401:
      //   return this.c_401(resp);
      case 404:
        return this.c_404(resp);
      case 412:
        return this.c_412(resp);
      case 500:
        return this.c_500(resp);
      default:
        return throwError(resp);
    }
  }

  c_400(resp) {
    if (
      this.isBank() &&
      this.activeOrganization &&
      this.activeModule &&
      this.activeModule.moduleName === 'credit_card'
    ) {
      this.errorSubject.next({
        ...this.errorState,
        errorMessage: 'Limit Bincode Exeeded'
      });
    }
    return throwError(resp);
  }

  // c_401(resp) {
  //   this.ls.clear('Bearer');
  //   this.toastr.error(`Your session timeout was reached, please login again.`, 'Session Timeout', {
  //     closeButton: true,
  //   });
  //   setTimeout(() => {
  //     window.location.replace('/login');
  //   }, 1500);
  //   return throwError(resp);
  // }

  c_404(resp) {
    return throwError(resp);
  }

  c_412(resp) {
    return throwError(resp);
  }

  c_500(resp) {
    this.isMalwareError();
    this.isErrorResourceList(resp);
    return throwError(resp);
  }

  isMalwareError() {
    if (
      this.activeOrganization &&
      this.activeModule &&
      this.activeModule.moduleName === 'malware' &&
      this.router.url.indexOf('malware') > -1
    ) {
      this.errorSubject.next({
        ...this.errorState,
        errorMessage: '500: Internal Server Error in Malware',
        errorNavigationRute: [`/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}`]
      });
    }
  }

  isErrorResourceList(resp) {
    if (
      this.activeOrganization &&
      this.activeModule &&
      resp &&
      resp._body &&
      resp._body.message &&
      JSON.parse(resp._body).message === 'error.resource_list' &&
      this.router.url.indexOf('resource') > -1
    ) {
      this.errorSubject.next({
        ...this.errorState,
        errorMessage:
          'There was a problem retrieving the selected page. Please, try again later or contact your administrator.',
        errorNavigationRute: [`/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}`]
      });
    }
  }

  getError() {
    return this.errorSubject;
  }

  resetError() {
    this.errorSubject.next(null);
  }

  setErrorContext(context) {
    this.activeOrganization = context.currentOrganization;
    this.activeModule = context.currentModule;
  }

  isBank() {
    return this.router.url.indexOf('bank') >= 0;
  }
}
