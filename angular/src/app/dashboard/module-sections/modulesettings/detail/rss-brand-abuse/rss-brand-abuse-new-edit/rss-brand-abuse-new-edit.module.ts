import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { RssBrandAbuseNewEditComponent } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse-new-edit/rss-brand-abuse-new-edit.component';
import { TlpModule } from 'app/dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { UploaderModule } from 'app/dashboard/module-sections/shared/uploader/uploader.module';

@NgModule({
  imports: [FormsModule, CommonModule, ReactiveFormsModule, TlpModule, UploaderModule],
  declarations: [RssBrandAbuseNewEditComponent],
  providers: [],
  exports: [RssBrandAbuseNewEditComponent],
})
export class RssBrandAbuseNewEditModule {}
