import { filter } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { ErrorService } from 'app/error/error.service';
import { ErrorInterface } from 'app/error/error.model';
import { Router } from '@angular/router';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit, OnDestroy {
  activeModule: any;
  activeOrganization: any;
  zIndex = 2000;
  subscriptionsList: any[] = [];
  errorState: ErrorInterface = {
    errorMessage: 'Error',
    errorNavigationRute: [''],
  };
  showErrorMessage: boolean = false;

  constructor(
    protected router: Router,
    private errorService: ErrorService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    const s = this.errorService
      .getError()
      .pipe(filter(Boolean))
      .subscribe((res: ErrorInterface) => {
        this.showErrorMessage = true;
        this.errorState = res;
      });
    this.subscriptionsList.push(s);

    const s2 = this.organizationService.getCurrentContext().subscribe(context => {
      if (context && context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.errorService.setErrorContext(context);
      }
    });
    this.subscriptionsList.push(s2);
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    this.subscriptionsList.forEach(subscription => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
  }

  errorAction() {
    this.showErrorMessage = false;
    this.errorService.resetError();
    if (this.errorState.errorNavigationRute) {
      this.router.navigate(this.errorState.errorNavigationRute);
    }
  }
}
