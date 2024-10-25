import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IndicatorsService } from '../../../../../../core/models/indicators.service';
import { IndicatorsBackendRequestTypes } from '../../../indicators-backend-request.types';

@Component({
  selector: 'app-indicators-details-tabs-dns',
  templateUrl: './indicators-details-tabs-dns.component.html',
  styleUrls: ['./indicators-details-tabs-dns.component.scss'],
})
export class IndicatorsDetailsTabsDnsComponent implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorType;
  showRaw = false;
  showActiveDNS = false;
  dns;
  passiveDns = [];
  whoIs;
  private readonly destroy$ = new Subject<void>();

  constructor(private indicatorsService: IndicatorsService) {}

  ngOnInit() {
    if (this.indicatorType !== IndicatorsBackendRequestTypes.IP) {
      this.showActiveDNS = true;
      this.getDNS();
    }
    this.getWhoIs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDNS() {
    const params = { page: 1, limit: 10 };
    this.indicatorsService
      .getGenericDetails({ id: this.indicatorId, type: this.indicatorType, extension: 'enrichment/dns', params })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        this.dns = data.attributes;
      });
  }

  getWhoIs() {
    const params = {};
    this.indicatorsService
      .getGenericDetails({ id: this.indicatorId, type: this.indicatorType, extension: 'enrichment/whois', params })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        this.whoIs = data.attributes;
      });
  }

  toogleRaw() {
    this.showRaw = !this.showRaw;
  }

  prettifyWhois() {
    return this.prettifyObject(this.whoIs);
  }

  private prettifyObject(toPrettify: {}) {
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
}
