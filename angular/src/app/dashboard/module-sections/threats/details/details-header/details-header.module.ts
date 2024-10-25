import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DetailsHeaderComponent } from './details-header.component';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { DetailHeaderService } from 'app/dashboard/module-sections/threats/details/details-header/details-header.service';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { StarRatingBluelivModule } from 'app/dashboard/module-sections/shared/table/table-tools/star-rating-blueliv/star-rating-blueliv.module';
import { InformModule } from 'app/dashboard/module-sections/shared/table/table-tools/inform/inform.module';
import { SelectLanguageModule } from 'app/dashboard/module-sections/threats/details/details-header/select-language/select-language.module';
import { SeverityModule } from 'app/dashboard/module-sections/shared/table/table-tools/severity/severity.module';
import { ClipboardModule } from 'app/shared/directives/clipboard/clipboard.module';
import { SharedModule } from '../../../../../shared/shared.module';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    CommonModule,
    ResourceIssuesModule,
    ModalModule,
    LabelItemModule,
    StarRatingBluelivModule,
    InformModule,
    SelectLanguageModule,
    SeverityModule,
    ClipboardModule,
    SharedModule
  ],
  declarations: [DetailsHeaderComponent],
  providers: [DetailHeaderService],
  bootstrap: [DetailsHeaderComponent],
  exports: [DetailsHeaderComponent]
})
export class DetailsHeaderModule {}
