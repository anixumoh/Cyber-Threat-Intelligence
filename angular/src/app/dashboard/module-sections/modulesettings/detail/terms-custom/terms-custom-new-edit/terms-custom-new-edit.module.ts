import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { UploaderModule } from 'app/dashboard/module-sections/shared/uploader/uploader.module';
import { UploaderSettingsModule } from 'app/dashboard/module-sections/shared/uploader-settings/uploader-settings.module';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { TermsCustomNewEditComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom-new-edit/terms-custom-new-edit.component';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    EnableDisableModule,
    UploaderModule,
    UploaderSettingsModule,
    ModalModule,
  ],
  declarations: [TermsCustomNewEditComponent],
  providers: [],
  exports: [TermsCustomNewEditComponent],
})
export class TermsCustomNewEditModule {}
