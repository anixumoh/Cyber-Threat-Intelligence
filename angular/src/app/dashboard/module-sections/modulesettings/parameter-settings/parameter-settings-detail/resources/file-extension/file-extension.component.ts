import {Component, Input} from '@angular/core';
import {GenericParameter} from "../generic-parameter/generic-parameter";
import {FileExtensions} from "./file-extensions";
import {ModuleSettingsDetailService} from "../../../../detail/module-settings-detail.service";
import {Grants} from "../../../../../../../services/grants/grants";

export function fileExtensionFactory(moduleSettingsDetailService: ModuleSettingsDetailService, parameterObject: GenericParameter) {
  return new FileExtensions(moduleSettingsDetailService, parameterObject)
}

@Component({
  selector: 'app-file-extension',
  templateUrl: './file-extension.component.html',
  styleUrls: ['./file-extension.component.scss'],
  providers: [
    GenericParameter,
    {
      provide: FileExtensions,
      useFactory: fileExtensionFactory,
      deps: [ModuleSettingsDetailService, GenericParameter]
    }
  ],
})
export class FileExtensionComponent  {
  isShowInfo = false;
  @Input() set parameter(its) {
    this.parameterObject.setParameter(its);
    this.parameterObject.setParameterData(
      its,
      this.fileExtensionsObject.activateCheckboxes.bind(this.fileExtensionsObject)
    );
  };

  constructor(
    public parameterObject: GenericParameter,
    public fileExtensionsObject: FileExtensions,
    public grants: Grants
    ) {
  }

  public sendStatus(value){
    this.fileExtensionsObject.sendStatus(value);
  }

  public renderValue(item) {
    return item && item.value ? item.value : '-';
  }

  public toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }
}
