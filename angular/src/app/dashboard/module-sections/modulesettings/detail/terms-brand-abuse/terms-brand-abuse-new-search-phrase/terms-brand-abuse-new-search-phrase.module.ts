import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { UploaderModule } from 'app/dashboard/module-sections/shared/uploader/uploader.module';
import { UploaderSettingsModule } from 'app/dashboard/module-sections/shared/uploader-settings/uploader-settings.module';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { TermsBrandAbuseNewSearchPhraseComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse-new-search-phrase/terms-brand-abuse-new-search-phrase.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    EnableDisableModule,
    UploaderModule,
    UploaderSettingsModule,
  ],
  declarations: [TermsBrandAbuseNewSearchPhraseComponent],
  providers: [],
  exports: [TermsBrandAbuseNewSearchPhraseComponent],
})
export class TermsBrandAbuseNewSearchPhraseModule {}
