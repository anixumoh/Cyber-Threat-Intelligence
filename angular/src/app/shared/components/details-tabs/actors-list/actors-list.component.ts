import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { ServerList } from 'app/shared/cs/server-list';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import * as moment from 'moment';
import { ThreatContextNavigationService } from '../../threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'actors-list',
  templateUrl: './actors-list.component.html'
})
export class ActorsListComponent extends ServerList implements OnInit, OnDestroy {
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
    const navigation = this.threatContextNavigationService.getNavigation(name, `actors/${id}`);
    this.newTabService.openNewTab(event, url, { navigation });
  }

  preventDefault(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  getDetailsLink(id) {
    return `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/actors/${id}`;
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'actors');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'actors', 'json');
  }

  sortBy(value) {
    this.sort = value;
    this.reloadData();
  }

  reloadData() {
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
          this.count = meta ? meta.pagination.count : 0;
          this.items = data.map(({ id, attributes }) => {
            return {
              id,
              name: attributes.name,
              tlp: attributes.tlp,
              firstSeen: attributes.first_seen,
              lastSeen: attributes.last_seen
            };
          });
        }
      });
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TLP: item.tlp,
        'FIRST SEEN': moment(item.firstSeen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.lastSeen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
