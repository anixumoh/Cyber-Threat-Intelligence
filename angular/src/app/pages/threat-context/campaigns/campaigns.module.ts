import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignsListComponent } from './list/campaigns-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { FormsModule } from '@angular/forms';
import { InfoButtonModule } from '../../../dashboard/module-sections/shared/info-button/info-button.module';
import { TlpModule } from '../../../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { CampaignsDetailsComponent } from './details/campaigns-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    CampaignsRoutingModule,
    SharedModule,
    ModalModule,
    FormsModule,
    InfoButtonModule,
    TlpModule,
    NgbModule,
  ],
  declarations: [CampaignsListComponent, CampaignsDetailsComponent],
})
export class CampaignsModule {}
