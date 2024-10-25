import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';

@Injectable()
export class DetailsService implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  subscriptionList = [];

  resourceSubject = new BehaviorSubject(false);

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    const s = this.organizationService.getCurrentContext().subscribe(context => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
    this.subscriptionList.push(s);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptionList.forEach(s => {
      if (s.unsubscribe) {
        s.unsubscribe();
      }
    });
  }

  setUpdateResourceSubject(state) {
    this.resourceSubject.next(state);
  }

  getUpdateResourceSubject(): Observable<boolean> {
    return this.resourceSubject.asObservable();
  }

  deleteThreats(resources: any): Observable<any> {
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource`;
    return this.httpUtils.put(allPath, resources);
  }
}
