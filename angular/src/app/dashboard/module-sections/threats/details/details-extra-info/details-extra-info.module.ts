import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { DetailExtraInfoService } from 'app/dashboard/module-sections/threats/details/details-extra-info/details-extra-info.service';
import { DetailsExtraInfoComponent } from 'app/dashboard/module-sections/threats/details/details-extra-info/details-extra-info.component';
import { MoreInfoDetailModule } from 'app/dashboard/module-sections/threats/details/details-extra-info/more-info-detail/more-info-detail.module';
import { AppUtilsModule } from 'app/utils/utils.module';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, ResourceIssuesModule, MoreInfoDetailModule, AppUtilsModule],
  declarations: [DetailsExtraInfoComponent],
  providers: [DetailExtraInfoService],
  exports: [DetailsExtraInfoComponent]
})
export class DetailExtraInfoModule {}
