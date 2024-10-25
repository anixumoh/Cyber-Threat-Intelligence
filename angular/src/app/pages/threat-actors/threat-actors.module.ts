import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreatActorsListComponent } from './list/threat-actors-list.component';
import { ThreatActorsDetailsComponent } from './details/threat-actors-details.component';
import { ThreatActorsRoutingModule } from './threat-actors-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { ModalModule } from '../../dashboard/module-sections/shared/modal/modal.module';
import { FormsModule } from '@angular/forms';
import { TlpModule } from '../../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { ThreatActorsDetailsDescriptionComponent } from './details/description/threat-actors-details-description.component';
import { ScoreColorModule } from '../../dashboard/intelligence/details-intelligence/share/score-color/score-color.module';
import { InfoButtonModule } from '../../dashboard/module-sections/shared/info-button/info-button.module';
import { ThreatActorsReportComponent } from './report/threat-actors-report.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedAdminModule } from '../../admin/shared/shared.module';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThreatActorsRoutingModule,
    NgbModule,
    SharedModule,
    MultiselectDropdownModule,
    ModalModule,
    TlpModule,
    ScoreColorModule,
    InfoButtonModule,
    NgbModule,
    TypeaheadModule.forRoot(),
    SharedAdminModule,
    MatSelectModule
  ],
  declarations: [
    ThreatActorsListComponent,
    ThreatActorsDetailsComponent,
    ThreatActorsDetailsDescriptionComponent,
    ThreatActorsReportComponent
  ],
  exports: []
})
export class ThreatActorsModule {}
