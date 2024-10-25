import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsListComponent } from './list/tools-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { FormsModule } from '@angular/forms';
import { InfoButtonModule } from '../../../dashboard/module-sections/shared/info-button/info-button.module';
import { TlpModule } from '../../../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { ToolsDetailsComponent } from './details/tools-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ToolsRoutingModule,
    SharedModule,
    ModalModule,
    FormsModule,
    InfoButtonModule,
    TlpModule,
    NgbModule,
  ],
  declarations: [ToolsListComponent, ToolsDetailsComponent],
})
export class ToolsModule {}
