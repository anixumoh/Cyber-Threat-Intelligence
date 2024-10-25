import { Component, Input } from '@angular/core';
import { Parameter } from '../parameter';
import { MarketPlaces } from './market-places';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { Grants } from '../../../../../../../services/grants/grants';

export function marketPlacesFactory(
  moduleSettingsDetailService: ModuleSettingsDetailService,
  parameterObject: Parameter
) {
  return new MarketPlaces(moduleSettingsDetailService, parameterObject);
}

@Component({
  selector: 'app-market-places',
  templateUrl: './market-places.component.html',
  styleUrls: ['./market-places.component.scss'],
  providers: [
    Parameter,
    Grants,
    {
      provide: MarketPlaces,
      useFactory: marketPlacesFactory,
      deps: [ModuleSettingsDetailService, Parameter],
    },
  ],
})
export class MarketPlacesComponent {
  @Input() set parameter(its) {
    this.parameterObject.setParameter(its);
    this.parameterObject.setParameterData(its, this.marketPlaces.setCountries.bind(this.marketPlaces));
  }

  constructor(public parameterObject: Parameter, public marketPlaces: MarketPlaces, public grants: Grants) {}

  selectMarketplace(event: any) {
    this.marketPlaces.selectMarketplace(event);
  }

  checkboxClicked(input: number) {
    this.marketPlaces.checkboxClicked(input);
  }
}
