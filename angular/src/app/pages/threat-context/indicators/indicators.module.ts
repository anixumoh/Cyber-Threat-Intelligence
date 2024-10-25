import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorsRoutingModule } from './indicators-routing.module';
import { IndicatorsComponent } from './list/indicators.component';
import { IndicatorsDetailsComponent } from './details/indicators-details.component';
import { SharedModule } from '../../../shared/shared.module';
import { TlpModule } from '../../../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { IndicatorsDetailsIpComponent } from './details/ip/indicators-details-ip.component';
import { IndicatorsDetailsFqdnComponent } from './details/indicators-details-fqdn/indicators-details-fqdn.component';
import { IndicatorsDetailsMalwareComponent } from './details/indicators-details-malware/indicators-details-malware.component';
import { IndicatorsDetailsCrimeServerComponent } from './details/indicators-details-crime-server/indicators-details-crime-server.component';
import { GaugeChartModule } from '../../../dashboard/module-sections/shared/chart/gauge-chart/gauge-chart.module';
import { IndicatorsDetailsTabContextComponent } from './details/tabs/context/indicators-details-tab-context.component';
import { IndicatorsDetailsTabContextHistoryComponent } from './details/tabs/context/history/indicators-details-tab-context-history.component';
import { SeverityModule } from '../../../dashboard/module-sections/shared/table/table-tools/severity/severity.module';
import { ScoreColorModule } from '../../../dashboard/intelligence/details-intelligence/share/score-color/score-color.module';
import { IndicatorsDetailsTabsDnsComponent } from './details/tabs/dns/indicators-details-tabs-dns.component';
import { IndicatorsDetailsTabsExternalComponent } from './details/tabs/external/indicators-details-tabs-external.component';
import { IndicatorsDetailsTabsSparksComponent } from './details/tabs/sparks/indicators-details-tabs-sparks.component';
import { IndicatorsDetailsTabsSourcesComponent } from './details/tabs/sources/indicators-details-tabs-sources.component';
import { IndicatorsDetailsTabsRelationsComponent } from './details/tabs/relations/indicators-details-tabs-relations.component';
import { InfoButtonModule } from 'app/dashboard/module-sections/shared/info-button/info-button.module';
import { PassiveDnsComponent } from './details/tabs/dns/passive-dns/passive-dns.component';
import { ActiveDnsComponent } from './details/tabs/dns/active-dns/active-dns.component';

@NgModule({
  imports: [
    CommonModule,
    IndicatorsRoutingModule,
    FormsModule,
    NgbModule,
    SharedModule,
    TlpModule,
    ModalModule,
    GaugeChartModule,
    SeverityModule,
    ScoreColorModule,
    Ng2SmartTableModule,
    NgbTooltipModule,
    InfoButtonModule
  ],
  declarations: [
    IndicatorsComponent,
    IndicatorsDetailsComponent,
    IndicatorsDetailsIpComponent,
    IndicatorsDetailsFqdnComponent,
    IndicatorsDetailsMalwareComponent,
    IndicatorsDetailsCrimeServerComponent,
    IndicatorsDetailsTabContextComponent,
    IndicatorsDetailsTabContextHistoryComponent,
    IndicatorsDetailsTabsDnsComponent,
    IndicatorsDetailsTabsExternalComponent,
    IndicatorsDetailsTabsSparksComponent,
    IndicatorsDetailsTabsSourcesComponent,
    IndicatorsDetailsTabsRelationsComponent,
    PassiveDnsComponent,
    ActiveDnsComponent
  ]
})
export class IndicatorsModule {}
