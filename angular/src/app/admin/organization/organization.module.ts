import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';

import { SharedAdminModule } from '../shared/shared.module';
import { ListOrganizationsComponent } from './list-organizations/list-organizations.component';
import { OrganizationService } from './organization.service';
import { UsersService } from '../users/users.service';
import { FiltersModule } from '../filters/filters.module';
import { LabelsModule } from '../labels/labels.module';
import { EditOrganizationComponent } from './edit-organization/edit-organization.component';
import { NewOrganizationComponent } from './new-organization/new-organization.component';
import { NewEditModuleComponent } from './new-edit-module/new-edit-module.component';
import { ModuleOptionComponent } from './module-option/module-option.component';
import { UsersModule } from '../users/users.module';
import { AppUtilsModule } from 'app/utils/utils.module';
import { CustomerService } from '../customer/customer.service';
import { OrgUsersComponent } from './org-users/org-users.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    SharedAdminModule,
    FiltersModule,
    LabelsModule,
    FiltersModule,
    UsersModule,
    AppUtilsModule,
    MatTabsModule,
    MatSlideToggleModule,
    NgbTooltipModule,
    MatCheckboxModule
  ],
  declarations: [
    ListOrganizationsComponent,
    EditOrganizationComponent,
    NewOrganizationComponent,
    NewEditModuleComponent,
    ModuleOptionComponent,
    OrgUsersComponent
  ],
  exports: [
    ListOrganizationsComponent,
    EditOrganizationComponent,
    NewOrganizationComponent,
    NewEditModuleComponent,
    ModuleOptionComponent
  ],
  providers: [UsersService, OrganizationService, CustomerService]
})
export class OrganizationModule { }

const routes: Routes = [{ path: '', component: ListOrganizationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), OrganizationModule],
  exports: [RouterModule]
})
export class OrganizationRouting { }
