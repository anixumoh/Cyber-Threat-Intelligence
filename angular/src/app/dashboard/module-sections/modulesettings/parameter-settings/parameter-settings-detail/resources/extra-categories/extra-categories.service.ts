import {GenericParameter} from "../generic-parameter/generic-parameter";
import {ModuleSettingsDetailService} from "../../../../detail/module-settings-detail.service";
import {Injectable} from "@angular/core";

@Injectable()
export class ExtraCategoriesService extends GenericParameter {
  constructor(
    protected moduleSettingsDetailService: ModuleSettingsDetailService
  ) {
    super(moduleSettingsDetailService);
  }
}
