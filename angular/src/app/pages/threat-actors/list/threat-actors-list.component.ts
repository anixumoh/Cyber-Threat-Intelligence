import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import moment from 'moment';

import { ISelectItem } from '../../../shared/components/select/select.component';
import { OrganizationService } from '../../../dashboard/organization/organization.service';
import { ActorsService } from '../../../core/models/actors.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../utils/functions';
import { Grants } from 'app/services/grants/grants';
import { IQuickFilter } from 'app/shared/components/tcx-quick-filters/tcx-quick-filters.component';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-threat-actors-list',
  templateUrl: './threat-actors-list.component.html',
  styleUrls: ['./threat-actors-list.component.scss']
})
export class ThreatActorsListComponent implements OnInit, OnDestroy {
  @ViewChild('attackNavigatorModal') attackNavModalRef: TemplateRef<any>;
  mitreDork;
  isAttackMatrixModal: boolean;
  items: any = [];
  loading = false;
  searchText = '';
  openModalDorks = false;
  dorkFields = [];
  showSaveSearchButton = false;
  page = 0;
  count = 0;
  totalResources = 0;
  limit = 15;
  listError = '';
  sort = '-last_seen';
  limits: ISelectItem[] = [
    { name: '10', value: 10 },
    { name: '15', value: 15 },
    { name: '20', value: 20 },
    { name: '30', value: 30 },
    { name: '50', value: 50 }
  ];
  filename = '';
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  queryFilter: { key: string | null; value: string } = null;
  quickFilters: IQuickFilter[] = [
    {
      title: 'Actors by Industry',
      filters: [
        { name: 'Finance', dork: 'targets:"financial-services"' },
        {
          name: 'Retail',
          dork: 'targets:"retail"'
        },
        {
          name: 'Insurance',
          dork: 'targets:"insurance"'
        },
        {
          name: 'Healthcare',
          dork: 'targets:"healthcare"'
        },
        {
          name: 'Pharma',
          dork: 'targets:"pharmaceuticals"'
        },
        {
          name: 'Telecommunications',
          dork: 'targets:"telecommunications"'
        },
        {
          name: 'Energy',
          dork: 'targets:"energy"'
        },
        {
          name: 'Government',
          dork: 'targets:"government"'
        },
        {
          name: 'Defence',
          dork: 'targets:"defence"'
        },
        {
          name: 'Manufacturing',
          dork: 'targets:"manufacturing"'
        },
        {
          name: 'Technology',
          dork: 'targets:"technology"'
        },
        {
          name: 'Transportation',
          dork: 'targets:"transportation"'
        }
      ]
    },
    {
      title: 'Actors by Region',
      filters: [
        {
          name: 'Europe',
          dork: 'targets:"Europe"'
        },
        {
          name: 'Latam',
          dork: 'targets:"South America" OR targets:"Central America" OR targets:"Mexico"'
        },
        {
          name: 'Middle East',
          dork: 'targets:"Middle East"'
        },
        {
          name: 'Asia',
          dork: 'targets:"Asia"'
        },
        {
          name: 'APAC',
          dork: 'targets:"Asia" OR targets:"Oceania"'
        },
        {
          name: 'North America',
          dork: 'targets:"North America"'
        },
        {
          name: 'Africa',
          dork: 'targets:"Africa"'
        }
      ],
      filters2: [
        {
          name: 'Germany',
          dork: 'targets:"Germany"'
        },
        {
          name: 'Spain',
          dork: 'targets:"Spain"'
        },
        {
          name: 'United Kingdom',
          dork: 'targets:"United Kingdom"'
        },
        {
          name: 'France',
          dork: 'targets:"France"'
        },
        {
          name: 'Saudi Arabia',
          dork: 'targets:"Saudi Arabia"'
        },
        {
          name: 'UAE',
          dork: 'targets:"United Arab Emirates"'
        },
        {
          name: 'United States',
          dork: 'targets:"United States"'
        }
      ]
    }
  ];
  bulk = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private actorsService: ActorsService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private newTabService: NewTabService,
    protected grants: Grants,
    private accountService: UserAccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    const { dork } = this.route.snapshot.queryParams;
    if (dork) {
      this.searchText = dork;
    }

    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    this.actorsService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.loadSavedSearches();

        this.reloadData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSavedSearches() {
    this.accountService.getSaveDorks('actors', this.quickFilters);

    const savedFilters = this.quickFilters.find((quick: IQuickFilter) => quick.title === 'Saved searches');
    if (savedFilters) {
      const defaultFilter = savedFilters?.filters.find((filter) => filter?.markAsDefault);
      if (defaultFilter) {
        this.searchText = defaultFilter?.dork;
      }
    }
  }

  improveDorks(dorks) {
    for (const key in dorks) {
      if (dorks.hasOwnProperty(key)) {
        switch (key) {
          case 'first_seen':
            dorks[key].description = `The first time the actor was seen in action.`;
            break;
          case 'last_seen':
            dorks[key].description = `The last time the actor was seen performing attacks`;
            break;
          case 'active':
            dorks[
              key
            ].description = `If the actor is still active or not. Example: <span class="set-dork-example">active:1</span>`;
            break;
          case 'aliases':
            dorks[
              key
            ].description = `Dork used to find actors searching for their aliases. Example: <span class="set-dork-example">aliases:"APT28"</span>`;
            break;
          case 'name':
            dorks[key].description = `Name of the actor.`;
            break;
          case 'cve':
            dorks[
              key
            ].description = `Finds actors using CVEs matching the dork. Example: <span class="set-dork-example">cve:^"CVE-"</span> (actors using any CVE)`;
            break;
          case 'country_code':
            dorks[
              key
            ].description = `The country attributed as origin of the actor (ISO code). Example: <span class="set-dork-example">country_code:"RU"</span>`;
            break;
          case 'country':
            dorks[
              key
            ].description = `The country attributed as origin of the actor. Example: <span class="set-dork-example">country:"Russia"</span>`;
            break;
          case 'campaigns':
            dorks[
              key
            ].description = `Finds actors whose campaign names match the value specified by the user. Example: <span class="set-dork-example">campaigns:~"COVID"</span>.`;
            break;
          case 'sophistication':
            dorks[
              key
            ].description = `The <a href="https://docs.google.com/document/d/1dIrh1Lp3KAjEMm8o2VzAmuV0Peu-jt9aAh1IHrjAroM/pub#h.8jm676xbnggg" target="_blank">actor sophistication defined by STIX</a>. Options: none | minimal | intermediate | advanced | expert | innovator | strategic.`;
            break;
          case 'targets_category':
            dorks[key].description =
              'Finds actors targeting a specific target category. Options: countries | regions | sectors | organizations | specifics.';
            break;
          case 'types':
            dorks[
              key
            ].description = `Actor types according to the STIX definition (more info <a href="https://docs.google.com/document/d/1dIrh1Lp3KAjEMm8o2VzAmuV0Peu-jt9aAh1IHrjAroM/pub#h.tqbl8z36yoir" target="_blank">here</a>).`;
            break;
          case 'targets':
            dorks[key].description =
              'Finds actors targeting specific objectives, following the “targets_category“ definition.' +
              ' In the case of industry sectors, <a href="https://docs.google.com/document/d/1dIrh1Lp3KAjEMm8o2VzAmuV0Peu-jt9aAh1IHrjAroM/pub#h.oogrswk3onck" target="_blank">the vocabulary defined in STIX is used</a>. Example: <span class="set-dork-example">targets:"Spain"</span>.';
            break;
          case 'tlp':
            dorks[
              key
            ].description = `Traffic Light Protocol, more info <a href="https://www.first.org/tlp/" target="_blank">here</a>. Options: red | amber | green | white.`;
            break;
        }
      }
    }
    delete dorks.id;
    return dorks;
  }

  setDork(dork) {
    this.openModalDorks = false;
    this.searchText = dork;
    this.search();
  }

  onChangeQuickFilter(filter) {
    this.searchText = filter.dork;
    this.search();
  }

  reload() {
    this.page = 0;
    this.reloadData();
  }

  onChangeLimit(item: ISelectItem) {
    this.limit = item.value;
    this.reload();
  }

  search() {
    this.reload();
    this.showSaveSearchButton = true;
  }

  onPageChange({ page }) {
    this.page = page;
    this.reloadData();
  }

  sortBy(value) {
    this.sort = value;
    this.reloadData();
  }

  openDetails(event, id) {
    if (event.target.type === 'checkbox') {
      return;
    }
    const route = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/actors/${id}`;
    this.newTabService.openNewTab(event, route, { dork: this.searchText });
  }

  checkSearchCriteriaHasDorks() {
    const currentDorks = Object.keys(this.dorkFields);
    return currentDorks.some((dork) => {
      const regex = new RegExp(`\\b(${dork})\\:[0-9"~\\^\\$\\+\\>\\<\\-\\=]+`);
      return regex.test(this.searchText);
    });
  }

  reloadData() {
    let searchValue = '';
    this.listError = '';
    let searchField = '';
    this.loading = true;
    const params: any = {
      limit: this.limit,
      page: this.page,
      sort: this.sort
    };
    if (this.searchText) {
      this.actorsService.searchValue = this.searchText;
      if (this.checkSearchCriteriaHasDorks()) {
        params.dork = this.searchText;
        this.mitreDork = this.searchText;
      } else {
        searchValue = this.searchText;
        searchField = 'name';
        this.mitreDork = `fuzzy_filter%5Bname%5D=${searchValue}`;
      }
    } else {
      this.mitreDork = '';
    }
    this.actorsService
      .list({ ...params, searchValue, searchField })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
        take(1)
      )
      .subscribe(
        ({ data, meta }) => {
          if (data) {
            this.bulk = false;
            this.items = data.map(({ id, attributes }) => ({ ...attributes, id }));
            this.count = meta.pagination.count <= 10000 ? meta.pagination.count : 10000;
            this.totalResources = meta.pagination.count;
          }
        },
        (error) => {
          if (error.status === 500) {
            this.listError = 'There was a problem with the search request.';
          } else if (error.status === 400) {
            this.listError = this.searchText
              ? 'Incorrect dork syntax. Please, check the Syntax help to guide you with this problem.'
              : 'There was a problem with the search request.';
          }
        }
      );
  }

  hasSomeChecked() {
    return this.items.some((item) => item.fxSelected);
  }

  setCheckedState(event) {
    this.items = this.items.map((item) => ({ ...item, fxSelected: event.target.checked }));
  }

  setChecked() {
    setTimeout(() => {
      this.bulk = this.getCheckedItems().length === this.items.length;
    });
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'actors');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'actors', 'json');
  }

  hideSaveSearchButton() {
    const savedFilters = this.quickFilters.find((quick: IQuickFilter) => quick.title === 'Saved searches');
    if (savedFilters) {
      const filter = savedFilters?.filters.find((filter) => filter?.dork === this.searchText);
      if (!filter) {
        this.showSaveSearchButton = false;
      }
    }
  }

  onSetSearchTerm($event) {
    this.searchText = $event;
    this.hideSaveSearchButton();
  }

  onClearSearchTerm() {
    this.searchText = '';
    this.search();
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  openAttackNavigatorModal() {
    this.modalService.open(this.attackNavModalRef, {
      modalDialogClass: 'attack-navigator-modal',
      backdrop: 'static',
      centered: true,
      scrollable: true,
      size: 'xl'
    });
  }

  private getCheckedItems() {
    return this.items.filter((item) => item.fxSelected);
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        ALIASES: (item.aliases || []).join(', ') || '-',
        SOPHISTICATION: item.sophistication,
        TLP: item.tlp,
        ACTIVE: item.active,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
