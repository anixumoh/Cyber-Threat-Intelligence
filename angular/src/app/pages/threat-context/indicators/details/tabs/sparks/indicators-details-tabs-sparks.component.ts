import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../../../shared/cs/server-list';
import { IndicatorsService } from '../../../../../../core/models/indicators.service';

@Component({
  selector: 'app-indicators-details-tabs-sparks',
  templateUrl: './indicators-details-tabs-sparks.component.html',
  styleUrls: ['./indicators-details-tabs-sparks.component.scss'],
})
export class IndicatorsDetailsTabsSparksComponent extends ServerList implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorType;

  sparks;
  sparkUrl = 'https://community.blueliv.com/#!';

  constructor(private indicatorsService: IndicatorsService) {
    super();
    this.limit = 100;
  }

  ngOnInit() {
    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  reloadData() {
    const params = { limit: 300 };
    this.loading = true;
    this.indicatorsService
      .getGenericDetails({ type: this.indicatorType, id: this.indicatorId, extension: 'spark', params })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        this.items = data.map((item) => ({ ...item.attributes, id: item.id }));
        if (meta) {
          this.count = meta.pagination.count;
        }
      });
  }
}
