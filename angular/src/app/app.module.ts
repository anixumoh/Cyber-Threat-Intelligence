import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InterceptorsModule } from 'app/services/interceptors/interceptors.module';
import { FilesService } from './services/files.service';
import { ModuleSectionsModule } from './dashboard/module-sections/module-sections.module';
import { HttpUtilsService } from './services/http-utils.service';
import { ModulesService } from './services/modules.service';
import { ResourcesService } from './services/resources.service';
import { UsersService } from './services/users.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routing } from './app.routing';
import { SharedModule } from './dashboard/module-sections/shared/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { OrganizationModule } from './dashboard/organization/organization.module';
import { TooltipModule } from 'ngx-tooltip';
import { AppComponent } from './app.component';
import { AccountModule } from './dashboard/user/account.module';
import { SignupComponent } from './signup/signup.component';
import { EmptyComponent } from './empty/empty.component';
import { AuthGuard } from './services/guards/auth-guard.service';
import { AdminGuard } from './services/guards/admin-guard.service';
import { AuthService } from './services/auth.service';
import { TrialService } from './services/trial.service';
import { NewTabService } from './services/new-tab.service';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { AppUtilsModule } from './utils/utils.module';
import { Store } from 'app/services/store/store';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import { LabelService } from 'app/dashboard/module-sections/shared/table/table-tools/labels/labels.service';
import { FiltersGenericService } from './services/filtersGeneric.service';
import { DashboardModule } from 'app/dashboard/dashboard.module';
import { ErrorService } from 'app/error/error.service';
import { Reducers } from 'app/services/store/reducers';
import { LabelsFactory } from 'app/dashboard/module-sections/shared/labels/labelsFactory';
import { ResourcesFactory } from 'app/services/resourcesFactory';
import { NotFoundModule } from 'app/page-not-found/page-not-found.module';
import { AccountFactory } from 'app/dashboard/user/accountFactory';
import { OrganizationGuard } from 'app/services/guards/organization-guard.service';
import { ModuleGuard } from 'app/services/guards/module-guard.service';
import { EmptyGrantsModule } from 'app/empty-grants/empty-grants.module';
import { Grants } from 'app/services/grants/grants';
import { GrantsGuard } from 'app/services/guards/grants-guard.service';
import { RECAPTCHA_LANGUAGE, RecaptchaModule } from 'ng-recaptcha';
import { InfoButtonModule } from './dashboard/module-sections/shared/info-button/info-button.module';
import { ToastrModule } from 'ngx-toastr';
import { CoreModule } from './core/core.module';
import { StarRatingModule } from 'angular-star-rating';
import { SharedModule as sharedRootLevel } from './shared/shared.module';
import { AssetsModule } from './pages/global-settings/assets.module';
import { OrganizationDashboardTabsModule } from './dashboard/organization/organization-dashboard-tabs/organization-dashboard-tabs.module';
import { ModalModule } from './dashboard/module-sections/shared/modal/modal.module';
import { ClipboardModule } from './shared/directives/clipboard/clipboard.module';
import { SvelteService } from './services/svelte.service';
import { SidebarService } from './services/sidebar.service';
import { ThreatDetailService } from './services/threat-detail.service';
import { CvesModule } from './pages/threat-context/cves/cves.module';

@NgModule({
  declarations: [AppComponent, SignupComponent, EmptyComponent],
  imports: [
    sharedRootLevel,
    BrowserModule,
    CommonModule,
    HttpClientModule,
    CoreModule,
    BrowserAnimationsModule,
    InterceptorsModule,
    FormsModule,
    ReactiveFormsModule,
    ModuleSectionsModule,
    routing,
    SharedModule,
    NgxWebstorageModule.forRoot(),
    ColorPickerModule,
    OrganizationModule,
    TooltipModule,
    AccountModule,
    AppUtilsModule,
    DashboardModule,
    NotFoundModule,
    EmptyGrantsModule,
    StarRatingModule.forRoot(),
    RecaptchaModule,
    ToastrModule.forRoot({
      preventDuplicates: true
    }),
    OrganizationDashboardTabsModule,
    InfoButtonModule,
    NgbModule,
    SharedModule,
    AssetsModule,
    ModalModule,
    ClipboardModule,
    CvesModule
  ],
  providers: [
    SvelteService,
    SidebarService,
    ThreatDetailService,
    GrantsGuard,
    AuthGuard,
    AdminGuard,
    OrganizationGuard,
    ModuleGuard,
    AuthService,
    TrialService,
    UsersService,
    ResourcesService,
    FiltersGenericService,
    ModulesService,
    ErrorService,
    HttpUtilsService,
    FilesService,
    NewTabService,
    Transformer,
    LabelService,
    Store,
    Reducers,
    LabelsFactory,
    ResourcesFactory,
    AccountFactory,
    {
      provide: RECAPTCHA_LANGUAGE,
      useValue: 'en'
    },
    Grants
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
