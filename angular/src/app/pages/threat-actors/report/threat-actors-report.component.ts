import { Component, OnDestroy, ViewEncapsulation, Input } from '@angular/core';
import { of as observableOf, Observable, Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

import { ISelectItem } from '../../../shared/components/select/select.component';
import { ActorsService } from '../../../core/models/actors.service';
import { CountriesService } from '../../../core/models/countries.service';
import { sectors } from './sectors';
import { regions } from './regions';
import { ModuleModel, OrganizationModel } from '../../../dashboard/organization/models';
import { OrganizationService } from '../../../dashboard/organization/organization.service';

const ReportTypes = {
  ACTOR: 'ACTOR',
  SECTOR: 'SECTOR',
  REGION: 'REGION',
  COUNRTY: 'COUNTRY',
  DORK: 'ACTOR_SEARCH'
};

const SELECTED_COUNTRY = {
  id: '',
  name: ''
};

@Component({
  selector: 'app-threat-actors-report',
  templateUrl: './threat-actors-report.component.html',
  styleUrls: ['./threat-actors-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThreatActorsReportComponent implements OnDestroy {
  @Input() dorkSearch;

  _hasResults;
  @Input()
  set hasResults(its) {
    this._hasResults = its;
  }

  get hasResults() {
    return this._hasResults;
  }

  loading = false;
  open = false;
  format = 'strategic';
  actors;
  reportTypes = ReportTypes;
  typeAheadLoading = false;
  types: ISelectItem[] = [
    { name: 'Threat Actor', value: ReportTypes.ACTOR },
    { name: 'Industry Sector', value: ReportTypes.SECTOR },
    { name: 'Country', value: ReportTypes.COUNRTY },
    { name: 'Region', value: ReportTypes.REGION },
    { name: 'Actor Search', value: ReportTypes.DORK }
  ];
  selectedType = this.types[0];
  searchActor: string;
  sectors = sectors;
  regions = regions;
  actorId;
  actorSuggestions$: Observable<any>;
  countryLoading = false;
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  countries = [];

  private actorSelected;
  sectorSelected = {
    name: '',
    dork: ''
  };
  regionSelected = {
    name: '',
    dork: ''
  };

  countrySelected = SELECTED_COUNTRY;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private actorsService: ActorsService,
    private countriesService: CountriesService,
    private organizationService: OrganizationService,
    private toastrService: ToastrService,
    private route: ActivatedRoute
  ) {
    this.setDefaultValues();

    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    this.actorSuggestions$ = new Observable((observer) => {
      observer.next(this.searchActor);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          const params = { limit: 8, page: 0, dork: `name:~"${query}"` };
          return this.actorsService.list(params).pipe(
            map((items) => {
              return items.data.map(({ id, attributes }) => ({ ...attributes, id }));
            })
          );
        }
        return observableOf([]);
      })
    );

    this.countriesService
      .getAllCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        this.countries = countries || [];
      });

    const { openReport } = this.route.snapshot.queryParams;
    if (openReport) {
      this.open = openReport;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setDefaultValues() {
    this.searchActor = '';
    this.selectedType = this.types[0];
    this.countrySelected = SELECTED_COUNTRY;
  }

  onSelectActor(event) {
    this.searchActor = event.value;
    this.actorSelected = event.value;
    this.actorId = event.item.id;
  }

  onSelectCountry(event) {
    const { value } = event;
    this.countrySelected = value;
  }

  onSelectSector(event) {
    const { value } = event;
    this.sectorSelected = value;
  }

  onSelectRegion(event) {
    const { value } = event;
    this.regionSelected = value;
  }

  onTypeChange(event) {
    const { value } = event;
    this.selectedType = value;
  }

  showModal() {
    this.open = true;
  }

  closeModal() {
    this.setDefaultValues();
    this.open = false;
  }

  download() {
    if (this.isValidReportRequest()) {
      this.loading = true;
      const { value } = this.selectedType;
      const body = {
        type: value,
        name: '',
        dork: ''
      };
      switch (value) {
        case ReportTypes.ACTOR:
          body['name'] = this.actorSelected;
          body['dork'] = this.actorId;
          break;
        case ReportTypes.SECTOR:
          body['name'] = this.sectorSelected.name;
          body['dork'] = this.sectorSelected.dork + '&sort=-last_seen';
          break;
        case ReportTypes.COUNRTY:
          body['name'] = this.countrySelected.name;
          body['dork'] = `targets:"${this.countrySelected.name}"` + '&sort=-last_seen';
          break;
        case ReportTypes.REGION:
          body['name'] = this.regionSelected.name;
          body['dork'] = this.regionSelected.dork + '&sort=-last_seen';
          break;
        case ReportTypes.DORK:
          body['name'] = 'Search';
          body['dork'] = this.dorkSearch + '&sort=-last_seen';
          break;
        default:
          this.toastrService.error('Invalid Report Type', 'Error');
      }

      this.actorsService
        .getReport(this.activeOrganization.id, this.activeModule.id, body)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            this.loading = false;
            if ((response && response.status === 204) || response == null) {
              this.toastrService.warning(
                'Unfortunately there are no results for the actor search and we could not generate the report. Please, try a different or less specific search to be able to download the threat intelligence report.',
                '',
                {
                  timeOut: 7000
                }
              );
              return;
            }
            if (response.error) {
              this.toastrService.error('The reporting server is too busy, please try again later.', 'Error');
              return;
            }
            let filename;
            let name;

            switch (value) {
              case ReportTypes.ACTOR:
                name = this.actorSelected.replace(/(-| )/g, '_');
                filename = `Blueliv_Strategic_Threat_Actor_Report_${name}.pdf`;
                break;
              case ReportTypes.SECTOR:
                name = this.sectorSelected.name.replace(/(-| )/g, '_');
                filename = `Blueliv_Strategic_Threat_Landscape_Report_${name}.pdf`;
                break;
              case ReportTypes.COUNRTY:
                name = this.countrySelected.name.replace(/(-| )/g, '_');
                filename = `Blueliv_Strategic_Threat_Landscape_Report_${name}.pdf`;
                break;
              case ReportTypes.REGION:
                name = this.regionSelected.name.replace(/(-| )/g, '_');
                filename = `Blueliv_Strategic_Threat_Landscape_Report_${name}.pdf`;
                break;
              case ReportTypes.DORK:
                filename = 'Blueliv_Strategic_Threat_Landscape_Report_Search.pdf';
                break;
              default:
                filename = 'Blueliv_Strategic_Threat_Landscape_Report.pdf';
            }

            const blob = new Blob([response], {
              type: 'application/octet-stream'
            });
            FileSaver.saveAs(blob, filename);

            this.toastrService.success(`Report generated!`);
            this.closeModal();
          },
          () => {
            this.loading = false;
            this.toastrService.error('There was a problem downloading the report', 'Error');
          }
        );
    }
  }

  isValidReportRequest(): boolean {
    const { value } = this.selectedType;
    switch (value) {
      case ReportTypes.ACTOR:
        return this.actorSelected && this.actorSelected === this.searchActor;
      case ReportTypes.SECTOR:
        return !!this.sectorSelected.name && !!this.sectorSelected.dork;
      case ReportTypes.COUNRTY:
        return !!this.countrySelected.name;
      case ReportTypes.REGION:
        return !!this.regionSelected.name && !!this.regionSelected.dork;
      case ReportTypes.DORK:
        return this.dorkSearch && this.hasResults;
      default:
        return false;
    }
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeAheadLoading = e;
  }
}
