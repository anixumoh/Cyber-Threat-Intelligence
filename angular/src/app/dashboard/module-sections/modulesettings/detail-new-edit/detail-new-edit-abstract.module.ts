import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';
import { TlpModule } from 'app/dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { UploaderModule } from 'app/dashboard/module-sections/shared/uploader/uploader.module';
import { UploaderSettingsModule } from 'app/dashboard/module-sections/shared/uploader-settings/uploader-settings.module';

@NgModule({
  imports: [FormsModule, CommonModule, ReactiveFormsModule, TlpModule, UploaderModule, UploaderSettingsModule],
  declarations: [DetailNewEditAbstractComponent],
  providers: [],
  exports: [DetailNewEditAbstractComponent]
})
export class DetailNewEditAbstractModule {}
