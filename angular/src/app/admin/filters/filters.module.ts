import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAdminModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ListFiltersComponent } from './list-filters/list-filters.component';
import { FiltersService } from './filters.service';
import { NewEditFiltersComponent } from './new-edit-filters/new-edit-filters.component';
import { OrganizationService } from '../organization/organization.service';
import { LabelsModule } from '../labels/labels.module';

const routes: Routes = [{ path: '', component: ListFiltersComponent }];

@NgModule({
  imports: [CommonModule, SharedAdminModule, LabelsModule],
  declarations: [ListFiltersComponent, NewEditFiltersComponent],
  exports: [ListFiltersComponent, NewEditFiltersComponent],
  providers: [FiltersService, OrganizationService],
})
export class FiltersModule {}
@NgModule({
  imports: [RouterModule.forChild(routes), FiltersModule],
  exports: [RouterModule],
})
export class FiltersRouting {}
