import { Component, Input, OnInit } from '@angular/core';
import { IndicatorsBackendRequestTypes } from '../../../indicators-backend-request.types';
import { IndicatorsService } from '../../../../../../core/models/indicators.service';

@Component({
  selector: 'app-indicators-details-tab-context',
  templateUrl: './indicators-details-tab-context.component.html',
  styleUrls: ['./indicators-details-tab-context.component.scss'],
})
export class IndicatorsDetailsTabContextComponent implements OnInit {
  @Input() indicatorType;
  @Input() indicatorId;
  indicatorsBackendRequestTypes = IndicatorsBackendRequestTypes;

  constructor(private indicatorsService: IndicatorsService) {}

  iocSource = params =>
    this.indicatorsService.getGenericDetails({
      id: this.indicatorId,
      type: this.indicatorType,
      extension: 'ioc',
      params,
    });

  ngOnInit() {}
}
