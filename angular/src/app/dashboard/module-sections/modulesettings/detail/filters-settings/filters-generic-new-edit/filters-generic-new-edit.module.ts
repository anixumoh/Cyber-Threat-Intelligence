import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';

import { MultiSelectModule } from 'app/dashboard/module-sections/shared/filters/multi-select/multi-select.module';
import { FiltersGenericNewEditComponent } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-generic-new-edit/filters-generic-new-edit.component';
import { StarRatingBluelivModule } from 'app/dashboard/module-sections/shared/table/table-tools/star-rating-blueliv/star-rating-blueliv.module';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { LabelstModuleTemp } from 'app/dashboard/module-sections/shared/labels/labels.module';
import { SharedAdminModule } from 'app/admin/shared/shared.module';
import { ItemComponent } from './item/item.component';
import { GenericListComponent } from './generic-list/generic-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FilterSectionComponent } from './filter-section/filter-section.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    StarRatingBluelivModule,
    LabelItemModule,
    LabelstModuleTemp,
    SharedAdminModule,
    MatStepperModule,
    MatExpansionModule,
    MatSlideToggleModule
  ],
  declarations: [FiltersGenericNewEditComponent, ItemComponent, GenericListComponent, FilterSectionComponent],
  providers: [],
  exports: [FiltersGenericNewEditComponent]
})
export class FiltersGenericNewEditModule {}
