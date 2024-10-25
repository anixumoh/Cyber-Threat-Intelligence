import {Injectable} from '@angular/core';
import {HttpUtilsService, path} from '../../../../../../services/http-utils.service';
import {OrganizationService} from '../../../../../organization/organization.service';
import {ModuleModel, OrganizationModel} from '../../../../../organization/models';
import {UserAccountService} from "../../../../../user/account.service";

@Injectable()
export class ModalTwoStepValidationService {

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



  postTwoStepValidation(body) {
    let url = `${path}/user/verify2FA`;
    return this.httpUtils.post(url, body);
  }

}
