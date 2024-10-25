import { Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModuleSettingsDetailViewComponent } from './module-settings-detail-view.component';
import { FiltersGenericNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-generic-new-edit/filters-generic-new-edit.module';
import { ModuleSettingsDetailNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/module-settings-detail-new-edit.module';
import { TermsCustomViewModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom-view/terms-custom-view.module';
import { TermsBrandAbuseViewImageModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse-view-image/terms-brand-abuse-view-image.module';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    TermsBrandAbuseViewImageModule,
    TermsCustomViewModule,
    FiltersGenericNewEditModule,
    ModuleSettingsDetailNewEditModule
  ],
  declarations: [ModuleSettingsDetailViewComponent],
  providers: [],
  exports: [ModuleSettingsDetailViewComponent]
})
export class ModuleSettingsDetailViewModule {
  constructor(private injector: Injector) {
    customElements.define(
      'angular-module-settings-detail-view',
      createCustomElement(ModuleSettingsDetailViewComponent, { injector })
    );
  }
}
