import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedAdminModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ToolbarModule } from '../dashboard/toolbar/toolbar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AsideModule } from '../aside/aside.module';
import { FiltersGenericNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-generic-new-edit/filters-generic-new-edit.module';
import { AlertsAsideModule } from 'app/dashboard/module-sections/alerts/alerts-aside/alerts-aside.module';
import { BaseAdminComponent } from './base-admin/base-admin.component';

@NgModule({
  imports: [
    CommonModule,
    SharedAdminModule,
    AdminRoutingModule,
    RouterModule,
    ToolbarModule,
    NgbModule,
    AsideModule,
    FiltersGenericNewEditModule,
    AlertsAsideModule
  ],
  declarations: [AdminComponent, BaseAdminComponent]
})
export class AdminModule {}
