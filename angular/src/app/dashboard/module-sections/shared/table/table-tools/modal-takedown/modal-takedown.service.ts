import {Injectable} from '@angular/core';
import {HttpUtilsService, path} from '../../../../../../services/http-utils.service';
import {OrganizationService} from '../../../../../organization/organization.service';
import {ModuleModel, OrganizationModel} from '../../../../../organization/models';
import {UserAccountService} from "../../../../../user/account.service";

@Injectable()
export class ModalTakedownService {

  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;

  constructor(
    private httpUtils: HttpUtilsService,
    private organizationService: OrganizationService,
    private userAccountService: UserAccountService
  ) {
    this.organizationService.getCurrentContext()
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });
  }


  // getTakeDownAvailable(resourceId, sourceName) {
  //   let url = `${path}/remediation/check/resource/${resourceId}/source/${sourceName}`;
  //   return this.httpUtils.get(url);
  // }

  postTakeDown(body) {
    let url = `${path}/remediation/takedown`;
    body = {
      ...body,
      organizationId: this.activeOrganization.id,
      moduleId: this.activeModule.id,
      requester: this.userAccountService.currentUser.name
    };
    return this.httpUtils.post(url, body);
  }

}
