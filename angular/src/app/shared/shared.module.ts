import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableComponent } from './mat-table/mat-table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { PaginationXComponent } from './components/pagination-x/pagination-x.component';
import { LabelsComponent } from './components/labels/labels.component';
import { TableComponent } from './components/table/table.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SelectComponent } from './components/select/select.component';
import { ModalIncidentComponent } from './components/modal-incident/modal-incident.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '../dashboard/module-sections/shared/modal/modal.module';
import { BasicListComponent } from './components/basic-list/basic-list.component';
import { ModalLabelFilterComponent } from './components/modal-label-filter/modal-label-filter.component';
import { LabelItemModule } from '../dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { AppUtilsModule } from '../utils/utils.module';
import { ListFilterComponent } from './components/list-filter/list-filter.component';
import { ModalComponent } from './components/modal/modal.component';
import { ManageLabelComponent } from './components/manage-label/manage-label.component';
import { ModalMoveResourcesComponent } from './components/modal-move-resources/modal-move-resources.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { MapComponent } from './components/map/map.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { IterablePipe } from './pipes/iterable.pipe';
import { BooleanComponent } from './components/boolean.component';
import { LargeTextComponent } from './components/large-text.component';
import { UploadComponent } from './components/upload/upload.component';
import { TargetsTableComponent } from './components/targets-list/targets-table.component';
import { ActorsTargetTabComponent } from './components/actors-target-tab/actors-target-tab.component';
import { TypeaheadComponent } from './components/typeahead/typeahead.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FlushListComponent } from './components/flush-list/flush-list.component';
import { TlpModule } from '../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { PanelTabsComponent } from './components/panel-tabs/panel-tabs.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { BadgeComponent } from './components/badge/badge.component';
import { ConfirmationModalComponent } from 'app/shared/components/confirmation-modal/confirmation-modal.component';
import { RenderLargeTextComponent } from './components/render-large-text/render-large-text.component';
import { VisualizationTreeComponent } from './components/visualization-tree/visualization-tree.component';
import { ActorsListComponent } from './components/details-tabs/actors-list/actors-list.component';
import { AttackPatternsComponent } from './components/details-tabs/attack-patterns/attack-patterns.component';
import { ToolsListComponent } from './components/details-tabs/tools-list/tools-list.component';
import { CampaignsListComponent } from './components/details-tabs/campaigns-list/campaigns-list.component';
import { CveListComponent } from './components/details-tabs/cve-list/cve-list.component';
import { ScoreColorModule } from '../dashboard/intelligence/details-intelligence/share/score-color/score-color.module';
import { SafePipe } from './pipes/safe.pipe';
import { SignaturesListComponent } from './components/details-tabs/signatures-list/signatures-list.component';
import { RelatedIocListComponent } from './components/details-tabs/related-ioc-list/related-ioc-list.component';
import { SparksListComponent } from './components/details-tabs/sparks-list/sparks-list.component';
import { RouterModule } from '@angular/router';
import { RequestDownloadMalwareByHashComponent } from './components/request-download-malware-by-hash/request-download-malware-by-hash.component';
import { ShowTabsPipe } from './components/tabs/show-tabs.pipe';
import { MentionsListComponent } from './components/details-tabs/mentions-list/mentions-list.component';
import { ActSwitchModule } from 'app/admin/shared/act-switch/act-switch.module';
import { TcxQuickFiltersComponent } from './components/tcx-quick-filters/tcx-quick-filters.component';
import { CopyToClipboardComponent } from './components/copy-to-clipboard/copy-to-clipboard.component';
import { TcxLinkeableModule } from './components/tcx-linkeable/tcx-linkeable.module';
import { IsDataIsLoadingThreatsModule } from '../dashboard/module-sections/shared/is-data-is-loading-threats/is-data-is-loading-threats.module';
import { MaterialDatepickerModule } from 'app/dashboard/module-sections/shared/filters/mat-datepicker/mat-datepicker.module';
import { AllowNumberOnlyDirective } from './directives/allow-number-only.directive';
import { MitreAttackNavigatorComponent } from './components/mitre-attack-navigator/mitre-attack-navigator.component';
import { SharedAdminModule } from '../admin/shared/shared.module';
import { CtxSearchComponent } from './components/ctx-search/ctx-search.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ExternalLinksDirective } from './directives/external-links/external-links.directive';
import { DateRangeComponent } from './components/date-range/date-range.component';
import { SearchDropdownModule } from 'app/dashboard/module-sections/shared/search-dropdown/search-dropdown.module';
import { ThreatContextNavigationModule } from './components/threat-context-navigation/threat-context-navigation.module';
import { TcxModalEditSavedSearchesComponent } from './components/tcx-modal-edit-saved-searches/tcx-modal-edit-saved-searches.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    MaterialDatepickerModule,
    ModalModule,
    LabelItemModule,
    AppUtilsModule,
    NgbModule,
    TypeaheadModule.forRoot(),
    TlpModule,
    ScoreColorModule,
    RouterModule,
    ActSwitchModule,
    TcxLinkeableModule,
    IsDataIsLoadingThreatsModule,
    NgxGraphModule,
    SharedAdminModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    SearchDropdownModule,
    ThreatContextNavigationModule
  ],
  exports: [
    PaginationXComponent,
    LabelsComponent,
    TableComponent,
    OverlayComponent,
    SpinnerComponent,
    SelectComponent,
    ModalIncidentComponent,
    BasicListComponent,
    ModalLabelFilterComponent,
    ListFilterComponent,
    ModalComponent,
    ManageLabelComponent,
    ModalMoveResourcesComponent,
    DrawerComponent,
    MapComponent,
    TimelineComponent,
    IterablePipe,
    SafePipe,
    BooleanComponent,
    LargeTextComponent,
    UploadComponent,
    TargetsTableComponent,
    ActorsTargetTabComponent,
    TypeaheadComponent,
    FlushListComponent,
    PanelTabsComponent,
    TabsComponent,
    BadgeComponent,
    ConfirmationModalComponent,
    RenderLargeTextComponent,
    VisualizationTreeComponent,
    ActorsListComponent,
    AttackPatternsComponent,
    ToolsListComponent,
    CveListComponent,
    CampaignsListComponent,
    SignaturesListComponent,
    RelatedIocListComponent,
    SparksListComponent,
    RequestDownloadMalwareByHashComponent,
    ShowTabsPipe,
    MentionsListComponent,
    TcxQuickFiltersComponent,
    CopyToClipboardComponent,
    TcxLinkeableModule,
    AllowNumberOnlyDirective,
    MitreAttackNavigatorComponent,
    MatTableComponent,
    CtxSearchComponent,
    ExternalLinksDirective,
    DateRangeComponent,
    ThreatContextNavigationModule,
    TcxModalEditSavedSearchesComponent
  ],
  declarations: [
    MitreAttackNavigatorComponent,
    AllowNumberOnlyDirective,
    PaginationXComponent,
    LabelsComponent,
    TableComponent,
    OverlayComponent,
    SpinnerComponent,
    SelectComponent,
    ModalIncidentComponent,
    BasicListComponent,
    ModalLabelFilterComponent,
    ListFilterComponent,
    ModalComponent,
    ManageLabelComponent,
    ModalMoveResourcesComponent,
    DrawerComponent,
    MapComponent,
    TimelineComponent,
    IterablePipe,
    SafePipe,
    BooleanComponent,
    LargeTextComponent,
    UploadComponent,
    TargetsTableComponent,
    ActorsTargetTabComponent,
    TypeaheadComponent,
    FlushListComponent,
    PanelTabsComponent,
    TabsComponent,
    BadgeComponent,
    ConfirmationModalComponent,
    RenderLargeTextComponent,
    VisualizationTreeComponent,
    ActorsListComponent,
    AttackPatternsComponent,
    ToolsListComponent,
    CampaignsListComponent,
    CveListComponent,
    SignaturesListComponent,
    RelatedIocListComponent,
    SparksListComponent,
    RequestDownloadMalwareByHashComponent,
    ShowTabsPipe,
    MentionsListComponent,
    TcxQuickFiltersComponent,
    CopyToClipboardComponent,
    MatTableComponent,
    CtxSearchComponent,
    ExternalLinksDirective,
    DateRangeComponent,
    TcxModalEditSavedSearchesComponent
  ]
})
export class SharedModule {}
