import { Component, OnDestroy, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../shared/cs/server-list';
import { IntelReports, intelReports } from './intel-reports.data';
import { ModuleModel, OrganizationModel } from '../../../../dashboard/organization/models';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-intel-reports-list',
  templateUrl: './intel-reports-list.component.html',
  styleUrls: ['./intel-reports-list.component.scss']
})
export class IntelReportsListComponent extends ServerList implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  items: IntelReports[] = [];

  constructor(private organizationService: OrganizationService, private accountService: UserAccountService) {
    super();
    this.limit = 50;
    this.sort = '-publicationDate';
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    this.accountService.getSaveDorks('intelReports', this.quickFilters);
    this.loadSavedSearches();

    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  reloadData() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.items = this.searchText
        ? intelReports.filter((item) => item.name.toLowerCase().includes(this.searchText.toLowerCase()))
        : intelReports;

      if (this.sort) {
        this.items = this._sort(this.sort);
      }
      this.count = this.items.length <= 10000 ? this.items.length : 10000;
      this.totalResources = this.items.length;
    }, 1300);
  }

  search() {
    this.items = this.searchText ? intelReports.filter((item) => item.name.includes(this.searchText)) : intelReports;
    super.search();
  }

  private _sort(field: string) {
    let _field = field;
    let sort = 1;
    if (field.startsWith('-')) {
      _field = field.substr(1);
      sort = -1;
    }
    return this.items.sort((a, b) => {
      const bandA = a[_field].toUpperCase();
      const bandB = b[_field].toUpperCase();

      if (field === 'publicationDate') {
        const dateA = +new Date(a[_field]);
        const dateB = +new Date(b[_field]);
        return dateA - dateB;
      } else {
        let comparison = 0;
        if (bandA > bandB) {
          comparison = sort;
        } else if (bandA < bandB) {
          comparison = sort * -1;
        }
        return comparison;
      }
    });
  }
}
