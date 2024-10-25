import { HttpUtilsService, host, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class BankService {
  organizationId: any;
  activeModule: any;
  activeOrganization: any;

  constructor(private organizationService: OrganizationService, private httpUtils: HttpUtilsService) {
    organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getBanks(searchBanks = ''): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/searchBank?name=${searchBanks}`;
    return this.httpUtils.get(url);
  }

  getBinCodes(bank = ''): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/bincodes?bank=${bank}`;
    return this.httpUtils.get(url);
  }

  postNewBank(data): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }

  deleteBincodes(data): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.put(url, data);
  }
}
