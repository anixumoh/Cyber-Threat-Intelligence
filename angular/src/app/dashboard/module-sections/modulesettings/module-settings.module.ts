import { Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppUtilsModule } from '../../../utils/utils.module';
import { ModuleSettingsComponent } from './module-settings.component';
import { ModuleSettingsDetailModule } from './detail/module-settings-detail.module';
import { ModuleSettingsService } from './module-settings.service';
import { ModuleSettingsDetailViewModule } from 'app/dashboard/module-sections/modulesettings/detail-view/module-settings-detail-view.module';
import { ModuleSettingsDetailNewEditModule } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/module-settings-detail-new-edit.module';
import { CommonModule } from '@angular/common';
import { ParameterSettingsComponent } from './parameter-settings/parameter-settings.component';
import { ParameterSettingsDetailComponent } from './parameter-settings/parameter-settings-detail/parameter-settings-detail.component';
import { GenericParameterComponent } from './parameter-settings/parameter-settings-detail/resources/generic-parameter/generic-parameter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HacktivismRssComponent } from './parameter-settings/parameter-settings-detail/resources/hacktivism-rss/hacktivism-rss.component';
import { CreditCardComponent } from './parameter-settings/parameter-settings-detail/resources/credit-card/credit-card.component';
import { FileExtensionComponent } from './parameter-settings/parameter-settings-detail/resources/file-extension/file-extension.component';
import { FeedsComponent } from './parameter-settings/parameter-settings-detail/resources/feeds/feeds.component';
import { AlertsComponent } from './parameter-settings/parameter-settings-detail/resources/alerts/alerts.component';
import { MarketPlacesComponent } from './parameter-settings/parameter-settings-detail/resources/market-places/market-places.component';
import { ToggleContainsDirective } from './parameter-settings/parameter-settings-detail/resources/toggle-contains.directive';
import { ToggleDirective } from './parameter-settings/parameter-settings-detail/resources/toggle.directive';
import { BankComponent } from './parameter-settings/parameter-settings-detail/resources/bank/bank.component';
import { ExtraCategoriesComponent } from './parameter-settings/parameter-settings-detail/resources/extra-categories/extra-categories.component';
import { TechProductComponent } from './parameter-settings/parameter-settings-detail/resources/tech-product/tech-product.component';

import { TyposquattingDistanceComponent } from './parameter-settings/parameter-settings-detail/resources/typosquatting-distance/typosquatting-distance.component';
import { InfiniteScrollProviderDirective } from './parameter-settings/parameter-settings-detail/resources/infinite-scroll-provider.directive';
import { InfiniteScrollConsumerDirective } from './parameter-settings/parameter-settings-detail/resources/infinite-scroll-consumer.directive';
import { InfoButtonModule } from '../shared/info-button/info-button.module';
import { ModalModule } from '../shared/modal/modal.module';
import { AlertsAsideModule } from '../alerts/alerts-aside/alerts-aside.module';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    NgbModule,
    AppUtilsModule,
    ModuleSettingsDetailModule,
    ModuleSettingsDetailViewModule,
    ModuleSettingsDetailNewEditModule,
    InfoButtonModule,
    ModalModule,
    AlertsAsideModule
  ],
  declarations: [
    ModuleSettingsComponent,
    ParameterSettingsComponent,
    ParameterSettingsDetailComponent,
    GenericParameterComponent,
    HacktivismRssComponent,
    CreditCardComponent,
    FileExtensionComponent,
    FeedsComponent,
    AlertsComponent,
    MarketPlacesComponent,
    ToggleContainsDirective,
    ToggleDirective,
    BankComponent,
    ExtraCategoriesComponent,
    TechProductComponent,
    TyposquattingDistanceComponent,
    InfiniteScrollProviderDirective,
    InfiniteScrollConsumerDirective
  ],
  providers: [ModuleSettingsService],
  bootstrap: [ModuleSettingsComponent],
  exports: [ModuleSettingsComponent]
})
export class ModuleSettingsModule {
  constructor(private injector: Injector) {
    customElements.define(
      'angular-app-parameter-settings',
      createCustomElement(ParameterSettingsComponent, { injector })
    );
  }
}
