import { take, finalize, takeUntil } from 'rxjs/operators';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ServerList } from '../../../cs/server-list';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import * as moment from 'moment';
import { ThreatContextNavigationService } from '../../threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'campaigns-list',
  templateUrl: './campaigns-list.component.html'
})
export class CampaignsListComponent extends ServerList implements OnInit, OnDestroy {
  @Input() source;
  orgId;
  moduleId;
  sort = '-last_seen';

  constructor(
    private organizationService: OrganizationService,
    private threatContextNavigationService: ThreatContextNavigationService,
    private newTabService: NewTabService
  ) {
    super();
  }

  ngOnInit(): void {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.moduleId = context.currentModule.id;
        this.orgId = context.currentOrganization.id;
      });
    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  details(event, { id, name }) {
    if (event.target.type === 'checkbox' || event.target.className.includes('icon-copy')) {
      return;
    }
    const url = this.getDetailsLink(id);
    const navigation = this.threatContextNavigationService.getNavigation(name, `campaigns/${id}`);
    this.newTabService.openNewTab(event, url, { navigation });
  }

  preventDefault(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  getDetailsLink(id) {
    return `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/campaigns/${id}`;
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'campaigns');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'campaigns', 'json');
  }

  sortBy(value) {
    this.sort = value;
    this.reloadData();
  }

  reloadData(config?: any) {
    const params = { limit: this.limit, page: this.page, sort: this.sort };
    this.loading = true;
    const source$ = this.source(params);
    source$
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        if (data) {
          this.bulk = false;
          this.items = data.map((item) => ({ ...item.attributes, id: item.id }));
          if (meta) {
            this.count = meta.pagination.count;
          }
        }
      });
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TLP: item.tlp,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
