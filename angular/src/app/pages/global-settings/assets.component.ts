import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, take, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AssetsService } from './assets.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { OrganizationModel } from 'app/dashboard/organization/models';
import { MODULES_TYPES_DICTIONARY, SETTINGS_PER_MODULE } from './modules';
import { SETTINGS_DICTIONARY } from './settings_dictionary';
import { ERROR_DICTIONARY } from './error-dictionary';
import { isEmpty } from 'lodash';
import * as FileSaver from 'file-saver';
import { Grants } from 'app/services/grants/grants';

const priorityTypes = ['DOMAIN', 'KEYWORD', 'IP', 'BANK'];
const priorityTypesSort = {
  DOMAIN: 1,
  KEYWORD: 2,
  IP: 3,
  BANK: 4
};

type TotalSetingResults = {
  [key: string]: {
    [key: string]: number;
  };
};

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnDestroy {
  SETTINGS_DICTIONARY = SETTINGS_DICTIONARY;
  MODULES_TYPES_DICTIONARY = MODULES_TYPES_DICTIONARY;
  settingErrors = ERROR_DICTIONARY;
  modules = SETTINGS_PER_MODULE;
  items = [];
  isExpandedModalOpen = false;
  allowedModules = [];
  tagsList = [];
  loading = false;
  displayedColumns: string[] = ['term', 'modules', 'tags'];
  allowedSettingTypes = [];
  settingTypes = [
    'TWITTER_TWEETS_FROM_PROFILE',
    'IMAGE',
    'EXTRA_CATEGORIES',
    'TWEETS_FROM_PROFILE',
    'TWITTER_PROFILE',
    'RSS',
    'CPE_TECH',
    'TYPO_KEYWORD_DISTANCE',
    'TYPO_KEYWORD_REGEX',
    'TYPOSQUATTING',
    'FILE_EXTENSION',
    'CONFIDENTIAL',
    'FILENAME',
    'KEYWORD',
    'CREDIT_CARD',
    'BANK',
    'EMAIL',
    'IP',
    'DOMAIN'
  ];
  filteredSettingTypes = [];
  filtersQuery = '';
  searchQuery = '';
  filters;
  progressBar = false;
  progressText = '';
  companies;
  products;
  versions;
  isFiltering = false;
  filteredTag = '';
  errorModal = false;
  errorInfo = { type: '', data: [], modules: [], tag: '' };
  displayedErrorColumns = ['value', 'error'];
  isTotalModalOpen = false;
  totalSettingsColPercent: { [key: string]: string } = {};
  totalSettings = {};
  totalSettingsLoading = false;
  totalSettingsDownloading = false;
  filterTotalSettings: 1 | 2 | 3 = 1; // 1 is all, 2 is enabled, 3 is disabled

  private activeOrganization: OrganizationModel;
  private readonly destroy$ = new Subject<any>();

  constructor(
    private assetsService: AssetsService,
    private organizationService: OrganizationService,
    private toastrService: ToastrService,
    public grants: Grants
  ) {
    this.loading = true;
    this.organizationService
      .getCurrentContext()
      .pipe(
        takeUntil(this.destroy$),
        take(2),
        switchMap((context: any) => {
          if (context) {
            this.activeOrganization = context.currentOrganization;
            return this.organizationService.getModulesStandalone(this.activeOrganization.id);
          }
        })
      )
      .pipe(
        takeUntil(this.destroy$),
        take(2),
        switchMap((res) => {
          this.allowedModules = res;
          const index = this.allowedModules.findIndex((x) => x.type === 'THREAT_CONTEXT');
          if (index > -1) {
            this.allowedModules.splice(index);
          }
          const moduleTypes = [...new Set(res.map((item) => item.type))];
          this.settingTypes.forEach((setting) => {
            moduleTypes.forEach((mod) => {
              if (
                this.modules[setting] &&
                this.modules[setting].indexOf(mod) > -1 &&
                this.allowedSettingTypes.indexOf(setting) === -1
              ) {
                this.allowedSettingTypes.unshift(setting);
              }
            });
          });
          return this.assetsService.getTags(this.activeOrganization.id);
        })
      )
      .subscribe((res: any) => {
        this.tagsList = res;
        this.list();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get showEditButton() {
    return (
      this.errorInfo.type === 'DOMAIN' &&
      !this.errorInfo.data.some((element: any) =>
        element.some(({ messageKey }: any) => messageKey === 'error.band_exceed_total')
      )
    );
  }

  list() {
    this.filteredSettingTypes = [];
    this.assetsService
      .getSettings(this.activeOrganization.id, this.filtersQuery + this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const priorityAssets = [];
        const newArray = [];
        const emptyAssets = [];

        this.settingTypes.forEach((setting) => {
          const obj = {
            type: setting,
            values: res[setting] || []
          };

          if (res[setting] && priorityTypes.includes(setting)) {
            Object.entries(priorityTypesSort).forEach((value) => {
              if (setting === value[0].toString()) {
                obj['sort'] = value[1];
              }
            });
            priorityAssets.push(obj);
            this.filteredSettingTypes.push(setting);
          } else if (
            res[setting] ||
            (this.isFiltering && this.filters && this.filters.settings && this.filters.settings.indexOf(setting) > -1)
          ) {
            newArray.unshift(obj);
            this.filteredSettingTypes.push(setting);
          } else if (!this.isFiltering && this.modules[setting]) {
            this.allowedModules.forEach((mod) => {
              if (
                !this.isFiltering &&
                this.modules[setting].indexOf(mod.type) > -1 &&
                this.filteredSettingTypes.indexOf(setting) === -1
              ) {
                emptyAssets.unshift(obj);
                this.filteredSettingTypes.push(setting);
              }
            });
          } else if (
            this.isFiltering &&
            this.modules[setting] &&
            this.filters &&
            this.filters.modules &&
            !this.filters.settings &&
            !this.filters.tags
          ) {
            const modules = this.filters.modules;
            modules.forEach((mod) => {
              if (this.modules[setting].indexOf(mod) > -1 && this.filteredSettingTypes.indexOf(setting) === -1) {
                emptyAssets.unshift(obj);
                this.filteredSettingTypes.push(setting);
              }
            });
          }
        });
        this.items = priorityAssets.sort((a, b) => a.sort - b.sort).concat(newArray.concat(emptyAssets));
        this.loading = false;
      });
  }

  applyFilters({ filters, query, isFiltering }: any) {
    this.loading = true;
    this.filters = filters;
    this.filtersQuery = query;
    this.isFiltering = isFiltering;
    this.filteredTag = '';
    this.list();
  }

  searchAssets({ query, isFiltering }: any) {
    this.loading = true;
    this.searchQuery = query;
    this.isFiltering = isFiltering;
    this.list();
  }

  resetFilters() {
    this.loading = true;
    this.filters = null;
    this.filtersQuery = '';
    this.isFiltering = false;
    this.filteredTag = '';
    this.list();
  }

  editElement(e, reload?) {
    this.progressBar = true;
    this.progressText = 'Editing settings...';
    const service = e.type === 'IMAGE' ? 'editTags' : 'editElement';

    this.assetsService[service](this.activeOrganization.id, e)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          if (reload) {
            this.getTags();
          }
          this.reset();
        },
        () => {
          this.reset();
        }
      );
  }

  getTags() {
    this.assetsService
      .getTags(this.activeOrganization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.tagsList = res;
        this.list();
      });
  }

  reset() {
    this.loading = false;
    this.progressBar = false;
    this.progressText = '';
  }

  validateResponse(response: any[]) {
    return Object.entries(response).some(([key, value]: any) => value.length);
  }

  addSetting(data) {
    this.progressBar = true;
    this.progressText = 'Adding settings...';

    const service = data.settingType === 'IMAGE' ? 'saveSettingsImage' : 'saveSettingsData';
    this.assetsService[service](this.activeOrganization.id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.reset();
          const { ok, failed } = res;
          if (ok === true || (!isEmpty(ok) && this.validateResponse(ok))) {
            this.list();
            this.toastrService.success(
              `The ${SETTINGS_DICTIONARY[data.settingType]} have been saved correctly.`,
              'Success'
            );
          }

          if (!isEmpty(failed)) {
            this.errorModal = true;
            this.errorInfo = {
              type: data.settingType,
              data: Object.keys(res.failed).map((key) => res.failed[key]),
              modules: data.modules,
              tag: data.tag
            };
          } else {
            this.assetsService.setErrorSubject('reset', data.settingType, null);
          }
        },
        (e) => {
          this.reset();
          this.toastrService.error(
            this.settingErrors[e.error.message]
              ? this.settingErrors[e.error.message]
              : 'There was an issue processing the request',
            'Error'
          );
        }
      );
  }

  deleteOneSetting(data) {
    const settingType = data.settingType.startsWith('credit') ? 'credit_card' : data.settingType;
    const isRss = settingType === 'RSS';
    const isTech = settingType === 'CPE_TECH';
    let value = data.term;
    if (isRss) {
      value = {
        url: value,
        title: value
      };
    } else if (isTech) {
      value = {
        cpe: data.cpe,
        title: value
      };
    }
    const values = [{ ...(isRss || isTech ? { ...value } : { value }) }];

    this.loading = true;
    this.progressBar = true;
    this.progressText = 'Deleting settings...';

    this.assetsService
      .deleteSetting(this.activeOrganization.id, data.modules, settingType, values)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const { ok, failed } = res;
          this.list();

          if (!isEmpty(failed)) {
            this.errorModal = true;
            this.errorInfo = {
              type: data.settingType,
              data: Object.keys(res.failed).map((key) => res.failed[key]),
              modules: data.modules,
              tag: data.tag
            };
          } else {
            this.reset();
            this.toastrService.success('Deleted succesfully', 'Success');
          }
        },
        () => {
          this.reset();
          this.toastrService.error('Something went wrong, please try again', 'Error');
        }
      );
  }

  deleteMultiple(data) {
    const settingType = data.settingType.startsWith('credit') ? 'credit_card' : data.settingType;
    const isTech = settingType === 'CPE_TECH';

    this.progressBar = true;
    this.progressText = 'Deletting settings...';
    const modules = data.data.map((a) => a.modules);
    const merged = [].concat.apply([], modules);
    const ids = merged.map((e) => {
      return e.moduleId;
    });

    const uniqueIds = [...new Set(ids)];

    const terms = data.data.map((a) => {
      if (isTech) {
        return { title: a.searchPhrase, cpe: a.cpe };
      } else {
        return { value: a.searchPhrase };
      }
    });

    this.assetsService
      .deleteSetting(this.activeOrganization.id, uniqueIds, settingType, terms)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const { ok, failed } = res;
          this.list();

          if (!isEmpty(failed)) {
            this.errorModal = true;
            this.errorInfo = {
              type: data.settingType,
              data: Object.keys(res.failed).map((key) => res.failed[key]),
              modules: data.modules,
              tag: data.tag
            };
          } else {
            this.progressBar = false;
            this.progressText = '';
            this.toastrService.success('Deleted succesfully', 'Success');
          }
        },
        () => {
          this.progressBar = false;
          this.progressText = '';
          this.toastrService.error('Something went wrong, please try again', 'Error');
        }
      );
  }

  searchTech(e) {
    const hacktivismId = this.allowedModules.find((mod) => mod.type === 'HACKTIVISM').id;
    switch (e.type) {
      case 'vendor':
        this.assetsService
          .getCompanies(this.activeOrganization.id, hacktivismId, e.text)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.companies = res;
          });
        break;

      case 'product':
        this.assetsService
          .getProductsByCompany(this.activeOrganization.id, hacktivismId, e.vendor, e.text, e.deprecated)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.products = res;
          });
        break;

      case 'version':
        this.assetsService
          .getVersionsByProduct(this.activeOrganization.id, hacktivismId, e.vendor, e.product, e.text, e.deprecated)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.versions = res;
          });
        break;
    }
  }

  filterByTag(e) {
    this.filteredTag = e;
  }

  getModuleName(id) {
    return this.allowedModules.find((x) => x.id === id).name;
  }

  getMessageKey(key) {
    return this.settingErrors[key] ? this.settingErrors[key] : 'There was a problem while processing the request';
  }

  closeErrorModal() {
    this.assetsService.setErrorSubject('reset', this.errorInfo.type, null);
    this.errorModal = false;
    this.progressBar = false;
    this.progressText = '';
  }

  editFailedTerms() {
    const terms = [];
    this.errorInfo.data.forEach((mod) => {
      terms.push(mod[0].field);
    });
    const unique = [...new Set(terms)];

    this.assetsService.setErrorSubject('edit', this.errorInfo.type, {
      terms: unique,
      modules: this.errorInfo.modules,
      tag: this.errorInfo.tag
    });
    this.errorModal = false;
  }

  openTotalModal() {
    this.isTotalModalOpen = true;
    this.totalSettingsLoading = true;
    const filter = this.filterTotalSettings === 1 ? null : this.filterTotalSettings === 2 ? true : false;
    this.assetsService
      .getTotalSettings(this.activeOrganization.id, filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: TotalSetingResults) => {
        // 80 divided + 20 fix for threats
        this.totalSettingsColPercent = Object.entries(result).reduce((acc, [key, val]) => {
          acc[key] = `${80 / (Object.keys(val).length - 1)}%`;
          return acc;
        }, {});
        this.totalSettings = Object.entries(result).reduce((acc, [key, val]) => {
          // THREATS is last element
          const orderedEntries = Object.entries(val).sort((a, b) => {
            if (a[0] === 'THREATS') {
              return 1;
            }
            if (b[0] === 'THREATS') {
              return -1;
            }
            return 0;
          });
          acc[key] = orderedEntries;
          return acc;
        }, {});
        this.totalSettingsLoading = false;
      });
  }

  closeTotalModal() {
    this.isTotalModalOpen = false;
  }

  downloadTotalSettings() {
    this.totalSettingsDownloading = true;
    this.assetsService
      .downloadTotalSettings(this.activeOrganization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        const blob = new Blob([result], {
          type: 'application/octet-stream'
        });
        FileSaver.saveAs(blob, `total_settings_org_${this.activeOrganization.id}_export.csv`);
        this.totalSettingsDownloading = false;
      });
  }

  chooseFilter() {
    this.openTotalModal();
  }
}
