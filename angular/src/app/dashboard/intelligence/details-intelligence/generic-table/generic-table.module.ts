import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { GenericTableComponent } from "app/dashboard/intelligence/details-intelligence/generic-table/generic-table.component";
import { RouterModule } from "@angular/router";
import { TlpModule } from 'app/dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { SeverityModule } from 'app/dashboard/module-sections/shared/table/table-tools/severity/severity.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { ListOrderModule } from 'app/dashboard/module-sections/shared/list-order/list-order.module';
import { ScoreColorModule } from 'app/dashboard/intelligence/details-intelligence/share/score-color/score-color.module';

@NgModule({
  declarations: [GenericTableComponent],
  imports: [
    CommonModule,
    RouterModule,
    TlpModule,
    SeverityModule,
    ModalModule,
    ListOrderModule,
    ScoreColorModule
  ],
  exports: [GenericTableComponent]
})

export class GenericTableModule { }
