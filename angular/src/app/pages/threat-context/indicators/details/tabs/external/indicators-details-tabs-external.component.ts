import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IndicatorsService } from '../../../../../../core/models/indicators.service';

import { LocalDataSource } from 'ng2-smart-table';
import { RenderLargeTextComponent } from 'app/shared/components/render-large-text/render-large-text.component';
import { IndicatorsBackendRequestTypes } from '../../../indicators-backend-request.types';
import { CopyToClipboardComponent } from '../../../../../../shared/components/copy-to-clipboard/copy-to-clipboard.component';

@Component({
  selector: 'app-indicators-details-tabs-external',
  templateUrl: './indicators-details-tabs-external.component.html',
  styleUrls: ['./indicators-details-tabs-external.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IndicatorsDetailsTabsExternalComponent implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorType;

  urlSource = new LocalDataSource();
  resolutionSource = new LocalDataSource();
  sampleSource = new LocalDataSource();
  pcapSource = new LocalDataSource();
  data;
  scans;
  showReport = false;
  showDetection = false;
  urlSettings = {
    actions: false,
    hideSubHeader: true,
    attr: {
      class: 'table table-hover table-indexed',
    },
    columns: {
      url: {
        title: 'Url',
        sort: false,
        filter: false,
        type: 'custom',
        renderComponent: CopyToClipboardComponent,
      },
      last_seen: {
        title: 'Last Seen',
        sort: true,
        filter: false,
        width: '20%',
      },
      detections: {
        title: 'Detections',
        sort: true,
        filter: false,
        width: '15%',
      },
      positives: {
        title: 'Positives',
        sort: true,
        filter: false,
        width: '15%',
      },
    },
  };

  resolutionSettings = {
    actions: false,
    hideSubHeader: true,
    attr: {
      class: 'table table-hover table-indexed',
    },
    columns: {
      resolution: {
        title: 'Resolution',
        sort: false,
        filter: false,
        type: 'custom',
        renderComponent: CopyToClipboardComponent,
      },
      last_seen: {
        title: 'Last Seen',
        sort: true,
        filter: false,
      },
    },
  };

  sampleSettings = {
    actions: false,
    attr: {
      class: 'table table-hover table-indexed',
    },
    columns: {
      sha256: {
        title: 'SHA-256',
        sort: false,
        filter: false,
        type: 'custom',
        renderComponent: CopyToClipboardComponent,
      },
      type: {
        title: 'Type',
        sort: false,
        valuePrepareFunction: (value, row) => value.charAt(0).toUpperCase() + value.slice(1),
        width: '20%',
        filter: {
          type: 'list',
          config: {
            selectText: 'Select...',
            list: [
              { value: 'downloaded', title: 'Downloaded' },
              { value: 'communicating', title: 'Communicating' },
              { value: 'unknown', title: 'Unkown' },
            ],
          },
        },
      },
      last_seen: {
        title: 'Last Seen',
        sort: true,
        filter: false,
        width: '20%',
      },
      detections: {
        title: 'Detections',
        sort: true,
        filter: false,
        width: '15%',
      },
      positives: {
        title: 'Positives',
        sort: true,
        filter: false,
        width: '15%',
      },
    },
  };

  pcapSettings = {
    actions: false,
    hideSubHeader: true,
    attr: {
      class: 'table table-hover table-indexed',
    },
    columns: {
      pcap: {
        title: 'PCAP',
        sort: true,
        filter: false,
      },
    },
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private indicatorsService: IndicatorsService) {}

  ngOnInit() {
    if (this.indicatorType !== IndicatorsBackendRequestTypes.Malware) {
      this.showReport = true;
      this.getReport();
    }
    if (
      this.indicatorType === IndicatorsBackendRequestTypes.Malware ||
      this.indicatorType === IndicatorsBackendRequestTypes.CrimeServer
    ) {
      this.showDetection = true;
      this.getScans();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  prettifyObject(toPrettify: {}) {
    let result = '<ul>';
    for (const key in toPrettify) {
      if (key === 'raw') {
        continue;
      }
      let element = '<li>' + key.replace(/_/g, ' ') + ':';
      if (toPrettify[key] === null) {
        element += ' null';
      } else if (typeof toPrettify[key] === 'object') {
        element += this.prettifyObject(toPrettify[key]);
      } else {
        element += ' ' + toPrettify[key].toString();
      }
      element += '</li>';
      result += element;
    }
    result += '</ul>';
    return result;
  }

  private getScans() {
    const params = {};
    this.indicatorsService
      .getGenericDetails({
        id: this.indicatorId,
        type: this.indicatorType,
        extension: 'enrichment/scans',
        params,
      })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        this.scans = data.attributes.scans;
      });
  }

  private getReport() {
    const params = {};
    this.indicatorsService
      .getGenericDetails({
        id: this.indicatorId,
        type: this.indicatorType,
        extension: 'enrichment/virus-total',
        params,
      })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        this.data = data.attributes;
        this.urlSource.load(this.data.urls);
        this.resolutionSource.load(this.data.resolutions);
        this.sampleSource.load(this.data.samples);
        if (this.data.hasOwnProperty('pcaps')) {
          const pcaps = [];
          for (const pcap of this.data.pcaps) {
            pcaps.push({ pcap });
          }
          this.pcapSource.load(pcaps);
        }
      });
  }
}
