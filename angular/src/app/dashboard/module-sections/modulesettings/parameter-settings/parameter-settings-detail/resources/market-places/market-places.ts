import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { Parameter } from '../parameter';

export class MarketPlaces {
  countries;

  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService, public parameterObject: Parameter) {}

  setCountries() {
    this.countries = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }];
    this.moduleSettingsDetailService.getCountriesList().subscribe(countries => {
      this.countries = countries;
      this.setMarketPlacesValues();
    });
  }

  selectMarketplace(event: any) {
    this.parameterObject.parameterData[2].value = event.target.value;
    this.sendData();
  }

  checkboxClicked(input: number) {
    this.parameterObject.parameterData[input].value = !this.parameterObject.parameterData[input].value;

    if (input === 0 && this.parameterObject.parameterData[0].value === false) {
      this.parameterObject.parameterData[2].value = null;
    }
    this.sendData();
  }

  protected sendData() {
    this.moduleSettingsDetailService.sendMarketplace(this.parameterObject.parameterData).subscribe();
  }

  private setMarketPlacesValues() {
    this.parameterObject.parameterData[0].value = this.parameterObject.parameterData[0].value === 'true';
    this.parameterObject.parameterData[1].value = this.parameterObject.parameterData[1].value === 'true';
  }
}
