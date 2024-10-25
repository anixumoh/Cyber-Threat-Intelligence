import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DynamicComponent } from './dynamic.component';
import { EmailModule } from 'app/dashboard/module-sections/modulesettings/detail/email/email.module';
import { DomainModule } from 'app/dashboard/module-sections/modulesettings/detail/domain/domain.module';
import { IpModule } from 'app/dashboard/module-sections/modulesettings/detail/ip/ip.module';
import { AlertModule } from 'app/dashboard/module-sections/modulesettings/detail/alert/alert.module';
import { KeywordsModule } from 'app/dashboard/module-sections/modulesettings/detail/keywords/keywords.module';
import { FilenameModule } from 'app/dashboard/module-sections/modulesettings/detail/filename/filename.module';
import { ConfidentialModule } from 'app/dashboard/module-sections/modulesettings/detail/confidential/confidential.module';
import { FileExtensionModule } from 'app/dashboard/module-sections/modulesettings/detail/file_extension/file_extension.module';
import { TyposquattingModule } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting/typosquatting.module';
import { TyposquattingKeywordModule } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting-keyword/typosquatting-keyword.module';
import { TyposquattingDistanceModule } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting-distance/typosquatting-distance.module';
import { TermsModule } from 'app/dashboard/module-sections/modulesettings/detail/terms/terms.module';
import { BankModule } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.module';
import { CreditCardModule } from 'app/dashboard/module-sections/modulesettings/detail/credit-card/credit-card.module';
import { FeedsModule } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.module';
import { ClassifyModule } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.module';
import { TwitterUsersModule } from 'app/dashboard/module-sections/modulesettings/detail/twitter-users/twitter-users.module';
import { HacktivismRssModule } from 'app/dashboard/module-sections/modulesettings/detail/hacktivism-rss/hacktivism-rss.module';
import { TechProductModule } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.module';
import { FiltersSettingsModule } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-settings.module';
import { TermsBrandAbuseModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse.module';
import { RssBrandAbuseModule } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse.module';
import { TermsCustomModule } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom.module';
import { MarketplacesModule } from 'app/dashboard/module-sections/modulesettings/detail/marketplaces/marketplaces.module';
import { RssCategoriesModule } from 'app/dashboard/module-sections/modulesettings/detail/rss-categories/rss-categories.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'ngx-tooltip';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    EmailModule,
    FeedsModule,
    DomainModule,
    BankModule,
    CreditCardModule,
    IpModule,
    AlertModule,
    KeywordsModule,
    TermsBrandAbuseModule,
    TermsCustomModule,
    FiltersSettingsModule,
    RssBrandAbuseModule,
    FilenameModule,
    ConfidentialModule,
    FileExtensionModule,
    RssCategoriesModule,
    TyposquattingModule,
    TyposquattingKeywordModule,
    TyposquattingDistanceModule,
    TermsModule,
    ClassifyModule,
    TwitterUsersModule,
    HacktivismRssModule,
    TechProductModule,
    TooltipModule,
    NgbModule,
    MarketplacesModule,
  ],
  declarations: [DynamicComponent],
  providers: [],
  bootstrap: [DynamicComponent],
  exports: [DynamicComponent, TooltipModule, NgbModule],
})
export class DynamicModule {}
