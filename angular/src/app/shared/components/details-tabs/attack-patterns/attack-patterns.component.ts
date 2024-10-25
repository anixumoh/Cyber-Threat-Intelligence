import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../cs/server-list';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import { ThreatContextNavigationService } from '../../threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'attack-patterns',
  templateUrl: './attack-patterns.component.html',
  styles: [
    `
      button.btn {
        height: 30px;
      }
    `
  ]
})
export class AttackPatternsComponent extends ServerList implements OnInit, OnDestroy {
  @Input() source;

  _actorName;
  @Input()
  set actorName(e) {
    this._actorName = `name:"${e}"`;
  }

  get actorName() {
    return this._actorName;
  }

  orgId;
  moduleId;
  isDisplayingList = true;

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
    const url = `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/attack-patterns/${id}`;
    const navigation = this.threatContextNavigationService.getNavigation(name, `attack-patterns/${id}`);
    this.newTabService.openNewTab(event, url, { navigation });
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'attack-patterns');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'attack-patterns', 'json');
  }

  reloadData(config?: any) {
    const params = { limit: this.limit, page: this.page };
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
          this.isDisplayingList = this.items.length > 0 && this.actorName ? false : true;
        }
      });
  }

  toggleListStyle() {
    this.isDisplayingList = !this.isDisplayingList;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TLP: item.tlp,
        SEVERITY: item.severity
      };
    });
  }
}
