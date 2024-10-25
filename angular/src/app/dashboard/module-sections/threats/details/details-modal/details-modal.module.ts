import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DetailsModalComponent } from './details-modal.component';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
// import { AgmCoreModule } from '@agm/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { AppUtilsModule } from 'app/utils/utils.module';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    CommonModule,
    ResourceIssuesModule,
    ModalModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBpDPNSJmRDZ2l_Qik7sCGFWYsGsh3RdKI',
    // }),
    SharedModule,
    AppUtilsModule
  ],
  declarations: [DetailsModalComponent],
  bootstrap: [DetailsModalComponent],
  exports: [DetailsModalComponent]
})
export class DetailsModalModule {}
