import { Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModuleSettingsDetailComponent } from './module-settings-detail.component';
import { ModuleSettingsDetailService } from './module-settings-detail.service';
import { DynamicModule } from 'app/dashboard/module-sections/modulesettings/detail/dynamic/dynamic.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule, DynamicModule, ModalModule],
  declarations: [ModuleSettingsDetailComponent],
  providers: [ModuleSettingsDetailService],
  bootstrap: [ModuleSettingsDetailComponent],
  exports: [ModuleSettingsDetailComponent]
})
export class ModuleSettingsDetailModule {
  constructor(private injector: Injector) {
    customElements.define(
      'angular-app-module-settings-detail',
      createCustomElement(ModuleSettingsDetailComponent, { injector })
    );
  }
}
