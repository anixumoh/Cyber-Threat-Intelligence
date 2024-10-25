import { take, takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../dashboard/organization/organization.service';
import { ServerList } from '../../cs/server-list';
import { convertToCSV, exportClientFile } from '../../../utils/functions';
import * as moment from 'moment';

export interface TargetListItem {
  id?: string | number;
  category: string;
  description: string;
}

export enum TargetListRoles {
  target = 1,
  actor = 2,
}

@Component({
  selector: 'app-targets-table',
  templateUrl: './targets-table.component.html',
  styleUrls: ['./targets-table.component.scss'],
})
export class TargetsTableComponent extends ServerList implements OnDestroy {
  @Input() items: any = [];
  @Input() loading = false;
  @Input() limit = 10;
  @Input() role: TargetListRoles = TargetListRoles.target;
  @Input() page = 0;
  @Input() count = 0;
  @Input() bgGray = false;
  @Input() name = 'targets';
  orgId;
  moduleId;
  roles = TargetListRoles;

  @Output() pageChange = new EventEmitter();

  constructor(private router: Router, private organizationService: OrganizationService) {
    super();
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(context => {
        this.moduleId = context.currentModule.id;
        this.orgId = context.currentOrganization.id;
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  details({ id }) {
    this.router.navigate([
      `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/targets/${id}`,
    ]);
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), this.name);
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), this.name, 'json');
  }

  onPageChange(event) {
    this.pageChange.emit(event);
  }

  private getExportableData(items) {
    return items.map(item => {
      return {
        CATEGORY: item.category,
        DESCRIPTION: item.description,
      };
    });
  }
}
