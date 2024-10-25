import { ModuleSectionsComponent } from './module-sections.component';

import { SharedModule } from 'app/dashboard/module-sections/shared/shared.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { TooltipModule } from 'ngx-tooltip';

import { UtilsModule } from 'app/services/utils';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { TableModule } from 'app/dashboard/module-sections/shared/table/table.module';
import { routing } from 'app/app.routing';
import { ModuleSettingsModule } from './modulesettings/module-settings.module';
import { FormsModule } from '@angular/forms';
import { DetailsModule } from './threats/details/details.module';
import { DetailsMalwareModule } from './threats/details-malware/details-malware.module';
import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { ListOrderModule } from 'app/dashboard/module-sections/shared/list-order/list-order.module';

@NgModule({
  declarations: [ModuleSectionsComponent],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    routing,
    ColorPickerModule,
    TooltipModule,
    TableModule,
    ModalModule,
    ListOrderModule,
    ModuleSettingsModule,
    DetailsModule,
    NgbModule,
    DetailsMalwareModule,
    UtilsModule,
    PaginationModule
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModuleSectionsModule {}
