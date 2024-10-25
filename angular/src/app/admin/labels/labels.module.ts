import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsService } from './labels.service';
import { SharedAdminModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ListLabelsComponent } from './list-tabs/list-labels/list-labels.component';
import { NewEditLabelsComponent } from './new-edit-labels/new-edit-labels.component';
import { ListTypeLabelsComponent } from './list-tabs/list-type-labels/list-type-labels.component';
import { ListTabsComponent } from './list-tabs/list-tabs.component';
import { NewEditTypeLabelsComponent } from './new-edit-type-labels/new-edit-type-labels.component';
import { LabelDetailComponent } from './label-detail/label-detail.component';
import { OrganizationService } from '../organization/organization.service';

const routes: Routes = [{ path: '', component: ListTabsComponent }];

@NgModule({
  imports: [CommonModule, SharedAdminModule],
  declarations: [
    ListLabelsComponent,
    NewEditLabelsComponent,
    ListTypeLabelsComponent,
    ListTabsComponent,
    NewEditTypeLabelsComponent,
    LabelDetailComponent,
  ],
  exports: [
    ListLabelsComponent,
    NewEditLabelsComponent,
    ListTypeLabelsComponent,
    ListTabsComponent,
    NewEditTypeLabelsComponent,
    LabelDetailComponent,
  ],
  providers: [LabelsService, OrganizationService],
})
export class LabelsModule {}

@NgModule({
  imports: [RouterModule.forChild(routes), LabelsModule],
  exports: [RouterModule],
})
export class LabelsRouting {}
