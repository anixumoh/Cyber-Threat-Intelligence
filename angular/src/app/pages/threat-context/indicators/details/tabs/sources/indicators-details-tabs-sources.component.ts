import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { IndicatorsService } from '../../../../../../core/models/indicators.service';
import { OrganizationService } from '../../../../../../dashboard/organization/organization.service';

@Component({
  selector: 'app-indicators-details-tabs-sources',
  templateUrl: './indicators-details-tabs-sources.component.html',
})
export class IndicatorsDetailsTabsSourcesComponent implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorType;
  activeModule = {};
  activeOrganization = {};
  loading = false;
  data;
  private readonly destroy$ = new Subject<void>();

  constructor(private indicatorsService: IndicatorsService, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });
    this.getData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getData() {
    const params = {};
    this.loading = true;
    this.indicatorsService
      .getGenericDetails({
        id: this.indicatorId,
        type: this.indicatorType,
        extension: 'source',
        params,
      })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }) => {
        const sources = data.map(({ id, attributes }) => ({ ...attributes, id })) || [];
        const timelineData = [];
        for (const entry of sources) {
          let timeLine = {};
          timeLine = {
            title: entry.name,
            description: entry.keyword,
            time: entry.created_at,
          };
          timelineData.push(timeLine);
        }
        this.data = timelineData;
      });
  }
}
