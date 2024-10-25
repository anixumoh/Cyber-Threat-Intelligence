import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { FiltersSettingsComponent } from '../../detail/filters-settings/filters-settings.component';
import { FileExtensionComponent } from './resources/file-extension/file-extension.component';
import { CreditCardComponent } from './resources/credit-card/credit-card.component';
import { HacktivismRssComponent } from './resources/hacktivism-rss/hacktivism-rss.component';
import { FeedsComponent } from './resources/feeds/feeds.component';
import { AlertsComponent } from './resources/alerts/alerts.component';
import { GenericParameterComponent } from './resources/generic-parameter/generic-parameter.component';
import { MarketPlacesComponent } from './resources/market-places/market-places.component';
import { BankComponent } from './resources/bank/bank.component';
import { ExtraCategoriesComponent } from './resources/extra-categories/extra-categories.component';
import { TechProductComponent } from './resources/tech-product/tech-product.component';
import { TyposquattingDistanceComponent } from './resources/typosquatting-distance/typosquatting-distance.component';
import { TermsComponent } from '../../detail/terms/terms.component';

@Component({
    selector: 'app-parameter-settings-detail',
    template: ` <div #dynamicComponentContainer></div> `
})
export class ParameterSettingsDetailComponent implements AfterViewInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;
  @Input() set parameter(its) {
    if (its) {
      this.its = its;
    }
  }
  private types_to_components = {
    email: GenericParameterComponent,
    domain: GenericParameterComponent,
    ip: GenericParameterComponent,
    keyword: GenericParameterComponent,
    confidential: GenericParameterComponent,
    typosquatting: GenericParameterComponent,
    typo_keyword_regex: GenericParameterComponent,
    twitter_profile: GenericParameterComponent,
    filename: GenericParameterComponent,
    RSS: HacktivismRssComponent,
    credit_card: CreditCardComponent,
    file_extension: FileExtensionComponent,
    booleans: FeedsComponent,
    alert: AlertsComponent,
    marketplaces: MarketPlacesComponent,
    bank: BankComponent,
    typo_keyword_distance: TyposquattingDistanceComponent,
    filters_settings: FiltersSettingsComponent,
    extra_categories: ExtraCategoriesComponent,
    tech_product: TechProductComponent,
    terms: TermsComponent,
  };
  private its: any;

  constructor(private fr: ComponentFactoryResolver) {}

  ngAfterViewInit(): void {
    const factory = this.fr.resolveComponentFactory(this.types_to_components[this.its.view_type]);
    const ref: any = this.dynamicComponentContainer.createComponent(factory);
    ref.instance.parameter = this.its;
    ref.changeDetectorRef.detectChanges();
  }
}
