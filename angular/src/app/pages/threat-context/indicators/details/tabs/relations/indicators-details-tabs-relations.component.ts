import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { IndicatorsService } from 'app/core/models/indicators.service';
import { IndicatorsBackendRequestTypes } from '../../../indicators-backend-request.types';

@Component({
  selector: 'app-indicators-details-tabs-relations',
  templateUrl: './indicators-details-tabs-relations.component.html',
  styleUrls: ['./indicators-details-tabs-relations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorsDetailsTabsRelationsComponent implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorName;
  @Input() indicatorType;

  loading = false;
  indicators;
  parents;
  startNode;
  killChainData = {
    nodes: [],
    links: [],
  };
  killChainSettings = {
    colorSchemeName: 'dynamicByTypesSCSS',
    orientation: 'TB',
    curveType: 'Linear',
    showLegend: false,
    fitContainer: true,
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private indicatorsService: IndicatorsService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.startNode = {
      id: 'start',
      label: this.indicatorName,
      type: this.indicatorType,
    };

    this.indicators = this.getIndicators();
    this.parents = this.getParents();
    const indicatorsObservables = [];
    for (const indicator of this.indicators) {
      indicatorsObservables.push(this.fetch({ extension: indicator }));
    }

    this.loading = true;
    forkJoin(indicatorsObservables)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe((results) => {
        let data = { nodes: [], links: [] };
        for (const item of results) {
          const aux = this.drawKillChain((item as any).data);
          data = { nodes: [...data.nodes, ...aux.nodes], links: [...data.links, ...aux.links] };
        }
        this.killChainData = { nodes: [this.startNode, ...data.nodes], links: [...data.links] };
        this.changeDetectorRef.markForCheck();
      });
    // for (const parent of this.parents) {
    //   this.fetch({ extension: parent });
    // }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetch({ extension }) {
    return this.indicatorsService.getGenericDetails({
      id: this.indicatorId,
      type: this.indicatorType,
      extension,
      params: {},
    });
  }

  private getParents() {
    let items = [];
    if (this.indicatorType === IndicatorsBackendRequestTypes.CrimeServer) {
      items = items.concat([IndicatorsBackendRequestTypes.FQDN]);
    }
    return items;
  }

  private getIndicators() {
    let items = [];
    switch (this.indicatorType) {
      case IndicatorsBackendRequestTypes.IP:
        items = items.concat([
          IndicatorsBackendRequestTypes.FQDN,
          IndicatorsBackendRequestTypes.Malware,
          'threat-actor',
          'campaign',
        ]);
        break;
      case IndicatorsBackendRequestTypes.FQDN:
        items = items.concat([
          IndicatorsBackendRequestTypes.Malware,
          IndicatorsBackendRequestTypes.CrimeServer,
          IndicatorsBackendRequestTypes.IP,
          'threat-actor',
          'campaign',
        ]);
        break;
      case IndicatorsBackendRequestTypes.Malware:
        items = items.concat([
          IndicatorsBackendRequestTypes.FQDN,
          IndicatorsBackendRequestTypes.IP,
          IndicatorsBackendRequestTypes.CrimeServer,
          'threat-actor',
          'campaign',
        ]);
        break;
      case IndicatorsBackendRequestTypes.CrimeServer:
        items = items.concat([IndicatorsBackendRequestTypes.FQDN, IndicatorsBackendRequestTypes.Malware]);
        break;
    }
    return items;
  }

  private drawKillChain(data: any, source: string | number = 'start') {
    const nodes = [];
    const links = [];
    for (const indicator of data) {
      const type = indicator.type.toLowerCase();
      const id = type + '_' + indicator.id;
      const node = {
        id,
        type,
        label:
          indicator.attributes.name ||
          indicator.attributes.sha256 ||
          indicator.attributes.crime_server_url ||
          indicator.attributes.address ||
          indicator.attributes.domain,
      };
      nodes.push(node);
      const link = {
        source,
        target: id,
        label: type,
      };
      links.push(link);
    }
    return { nodes, links };
  }
}
