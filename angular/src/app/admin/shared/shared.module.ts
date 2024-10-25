import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from './table/table.component';
import { InputControlComponent } from './input-control/input-control.component';
import { ModalModule } from '../../dashboard/module-sections/shared/modal/modal.module';
import { MultiSelectAdmiComponent } from './multi-select-admi/multi-select-admi.component';
import { ActionCircleComponent } from './action-circle/action-circle.component';
import { FacebookModule } from 'ngx-facebook';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActSwitchModule } from './act-switch/act-switch.module';
import { IsDataIsLoadingComponent } from './is-data-is-loading/is-data-is-loading.component';
import { MainHeaderV1Component } from './main-header-v1/main-header-v1.component';
import { StopPropagationDirective } from './directives/stop-propagation.directive';
import { PreventDefaultDirective } from './directives/prevent-default.directive';
import { AppUtilsModule } from 'app/utils/utils.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    NgbModule,
    ActSwitchModule,
    FacebookModule.forRoot(),
    AppUtilsModule,
  ],
  declarations: [
    TableComponent,
    InputControlComponent,
    MultiSelectAdmiComponent,
    ActionCircleComponent,
    IsDataIsLoadingComponent,
    MainHeaderV1Component,
    StopPropagationDirective,
    PreventDefaultDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    NgbModule,
    TableComponent,
    InputControlComponent,
    ReactiveFormsModule,
    ModalModule,
    MultiSelectAdmiComponent,
    ActionCircleComponent,
    ActSwitchModule,
    IsDataIsLoadingComponent,
    MainHeaderV1Component,
    StopPropagationDirective,
    PreventDefaultDirective,
  ],
})
export class SharedAdminModule {}
