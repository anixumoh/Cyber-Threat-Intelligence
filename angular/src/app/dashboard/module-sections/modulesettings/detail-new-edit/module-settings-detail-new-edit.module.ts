import { Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModuleSettingsDetailNewEditComponent } from './module-settings-detail-new-edit.component';
import { RssBrandAbuseNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse-new-edit/rss-brand-abuse-new-edit.module';
import { FiltersGenericNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-generic-new-edit/filters-generic-new-edit.module';
import { TermsCustomNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom-new-edit/terms-custom-new-edit.module';
import { TermsBrandAbuseNewSearchPhraseModule } from '../detail/terms-brand-abuse/terms-brand-abuse-new-search-phrase/terms-brand-abuse-new-search-phrase.module';
import { TermsBrandAbuseNewEditImageModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse-new-edit-image/terms-brand-abuse-new-edit-image.module';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    TermsBrandAbuseNewSearchPhraseModule,
    TermsBrandAbuseNewEditImageModule,
    TermsCustomNewEditModule,
    RssBrandAbuseNewEditModule,
    FiltersGenericNewEditModule
  ],
  declarations: [ModuleSettingsDetailNewEditComponent],
  providers: [],
  exports: [ModuleSettingsDetailNewEditComponent]
})
export class ModuleSettingsDetailNewEditModule {
  constructor(private injector: Injector) {
    customElements.define(
      'angular-module-settings-detail-new-edit',
      createCustomElement(ModuleSettingsDetailNewEditComponent, { injector })
    );
  }
}
