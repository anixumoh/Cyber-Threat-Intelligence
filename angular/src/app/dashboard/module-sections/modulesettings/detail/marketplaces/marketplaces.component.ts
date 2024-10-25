import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'app-marketplaces',
  templateUrl: './marketplaces.component.html',
  styleUrls: ['./marketplaces.component.scss'],
  host: { '(document:click)': 'onClickOutside($event)' },
})
export class MarketplacesComponent extends SettingDetailAbstract implements OnInit, OnDestroy {
  @ViewChild('dropDown') dropDown: ElementRef;
  @ViewChild('dropDownButton') dropDownButton: ElementRef;

  countrySelected = '';
  isMenuOpened = false;
  countries: any;
  selectedCountry = {};
  isShowInfo = false;

  ngOnInit() {
    this.initContext();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onClickOutside(event) {
    if (this.checkDropDown(event.target) && this.checkDropDownButton(event.target)) {
      this.isMenuOpened = false;
    }
  }

  checkDropDown(target) {
    return this.dropDown && this.dropDown.nativeElement && !this.dropDown.nativeElement.contains(target);
  }

  checkDropDownButton(target) {
    return (
      this.dropDownButton && this.dropDownButton.nativeElement && !this.dropDownButton.nativeElement.contains(target)
    );
  }

  setValues() {
    this.values = this.data.values;
    this.settings
      .getCountriesList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        this.countries = countries;
        this.setmarketPlacesValues();
      });
  }

  setmarketPlacesValues() {
    this.values[0].value = this.values[0].value == 'true';
    this.values[1].value = this.values[1].value == 'true';
    this.countrySelected = this.countries.find((l) => l.id == this.values[2].value).name;
  }

  selectMarketplace(country: any) {
    if (!this.grants.isCustomerOrOperator()) {
      this.countrySelected = country.name;
      this.values[2].value = country.id;
      this.sendData();
    }
  }
  checkboxClicked(input: number) {
    this.values[input].value = !this.values[input].value;
    this.sendData();
  }
  sendData() {
    this.settings.sendMarketplace(this.values).pipe(takeUntil(this.destroy$)).subscribe();
  }
  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }
}
