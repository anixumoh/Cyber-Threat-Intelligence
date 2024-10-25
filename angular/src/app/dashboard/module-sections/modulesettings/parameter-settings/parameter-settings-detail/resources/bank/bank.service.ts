import { Injectable } from '@angular/core';
import { OrganizationService } from '../../../../../../organization/organization.service';
import { HttpUtilsService, path } from '../../../../../../../services/http-utils.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class BankService {
  organizationId: any;
  activeModule: any;
  activeOrganization: any;

  constructor(
    private organizationService: OrganizationService,
    private httpUtils: HttpUtilsService,
    private toastrService: ToastrService
  ) {
    organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getBinCodes(bank: string = ''): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/bank`;
    return this.httpUtils.get(url);
  }

  postNewBank(data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }

  deleteBincodes(data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.put(url, data);
  }

  showError(body, title) {
    this.toastrService.info(body, title, {
      closeButton: true,
      timeOut: 0,
      extendedTimeOut: 0,
    });
  }
}
