import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { throwIfAlreadyLoaded } from './module-import.guard';
import { IncidentsService } from './models/incidents.service';
import { LabelsService } from './models/labels.service';
import { MalwaresService } from './models/malwares.service';
import { TargetsService } from './models/targets.service';
import { ThiappGateway } from './models/thiapp.gateway';
import { ActorsService } from './models/actors.service';
import { Gateway } from './models/gateway';
import { MessagesService } from 'app/core/models/messages.service';
import { ResourcesService } from './models/resources.service';
import { GladosGateway } from './models/glados.gateway';
import { IndicatorsService } from './models/indicators.service';
import { SignaturesService } from './models/signatures.service';
import { CountriesService } from './models/countries.service';
import { RegionsService } from './models/regions.service';
import { CvesService } from './models/cves.service';
import { ToolsService } from './models/tools.service';
import { CampaignsService } from './models/campaigns.service';
import { AttackPatternsService } from './models/attack-patterns.service';
import { MalwareAnalysisService } from './models/malware-analysis.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    IncidentsService,
    LabelsService,
    MalwaresService,
    TargetsService,
    ThiappGateway,
    ActorsService,
    Gateway,
    GladosGateway,
    MessagesService,
    ResourcesService,
    IndicatorsService,
    SignaturesService,
    CountriesService,
    RegionsService,
    CvesService,
    ToolsService,
    CampaignsService,
    AttackPatternsService,
    MalwareAnalysisService,
  ],
  declarations: [],
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
