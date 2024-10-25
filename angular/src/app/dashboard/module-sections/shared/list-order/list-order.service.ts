import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Store } from 'app/services/store/store';
import { ResourcesService } from 'app/services/resources.service';

@Injectable()
export class listOrderService {
  activeModule: any;
  activeOrganization: any;
  contextOservable: Subscription;

  orderListServiceSubject = new Subject();

  constructor(
    private httpUtils: HttpUtilsService,
    private organizationService: OrganizationService,
    private store: Store,
    private resourcesService: ResourcesService
  ) {
    this.contextOservable = this.organizationService.getCurrentContext().subscribe((context) => {
      if (context && context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }
}
