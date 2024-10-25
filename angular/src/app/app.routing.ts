import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/services/guards/auth-guard.service';
import { AdminGuard } from 'app/services/guards/admin-guard.service';
import { DetailsMalwareComponent } from 'app/dashboard/module-sections/threats/details-malware/details-malware.component';
import { ModuleSectionsComponent } from 'app/dashboard/module-sections/module-sections.component';
import { DetailsComponent } from 'app/dashboard/module-sections/threats/details/details.component';
import { SignupComponent } from 'app/signup/signup.component';
import { EmptyComponent } from 'app/empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrganizationComponent } from './dashboard/organization/organization.component';
import { CreateModuleComponent } from './dashboard/organization/create-module/create-module.component';
import { OrganizationGuard } from 'app/services/guards/organization-guard.service';
import { ModuleGuard } from 'app/services/guards/module-guard.service';
import { NotFoundComponent } from 'app/page-not-found/page-not-found.component';
import { EmptyGrantsComponent } from 'app/empty-grants/empty-grants.component';
import { GrantsGuard } from 'app/services/guards/grants-guard.service';
import { AssetsComponent } from './pages/global-settings/assets.component';
import { OrganizationDashboardTabsComponent } from './dashboard/organization/organization-dashboard-tabs/organization-dashboard-tabs.component';
import { CvesListComponent } from './pages/threat-context/cves/list/cves-list.component';
import { CvesDetailsComponent } from './pages/threat-context/cves/details/cves-details.component';

// Settings
import { ModuleSettingsComponent } from 'app/dashboard/module-sections/modulesettings/module-settings.component';
import { ModuleSettingsDetailComponent } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.component';
import { tabSetting } from './dashboard/module-sections/modulesettings/utils';
import { ParameterSettingsComponent } from './dashboard/module-sections/modulesettings/parameter-settings/parameter-settings.component';
import { ModuleSettingsDetailViewComponent } from 'app/dashboard/module-sections/modulesettings/detail-view/module-settings-detail-view.component';
import { ModuleSettingsDetailNewEditComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/module-settings-detail-new-edit.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'organizations/:id',
        component: OrganizationComponent,
        canActivate: [OrganizationGuard],
        children: [
          { path: '', component: OrganizationDashboardTabsComponent },
          { path: 'global-settings-old', component: AssetsComponent },
          {
            path: 'asset-discovery',
            loadChildren: () =>
              import('app/pages/asset-discovery/asset-discovery.module').then((m) => m.AssetDiscoveryModule)
          },
          {
            path: 'modules/:id',
            component: ModuleSectionsComponent,
            canActivate: [ModuleGuard],
            children: [
              { path: '', component: EmptyComponent },
              { path: 'resourcee/:id', component: DetailsComponent },
              {
                path: 'threat_context/malwares',
                loadChildren: () => import('app/pages/malwares/malwares.module').then((m) => m.MalwaresModule)
              },
              {
                path: 'threat_context/malware-analysis',
                loadChildren: () =>
                  import('app/pages/malware-analysis/malware-analysis.module').then((m) => m.MalwareAnalysisModule)
              },

              {
                path: 'threat_context/indicators',
                loadChildren: () =>
                  import('app/pages/threat-context/indicators/indicators.module').then((m) => m.IndicatorsModule)
              },
              {
                path: 'threat_context/signatures',
                loadChildren: () =>
                  import('app/pages/threat-context/signatures/signatures.module').then((m) => m.SignaturesModule)
              },
              {
                path: 'threat_context/intel-reports',
                loadChildren: () =>
                  import('app/pages/threat-context/intel-reports/intel-reports.module').then(
                    (m) => m.IntelReportsModule
                  )
              },
              {
                path: 'threat_context/cves',
                component: CvesListComponent
              },
              {
                path: 'threat_context/cves/:cveId',
                component: CvesDetailsComponent
              },

              {
                path: 'threat_context/tools',
                loadChildren: () => import('app/pages/threat-context/tools/tools.module').then((m) => m.ToolsModule)
              },
              {
                path: 'threat_context/attack-patterns',
                loadChildren: () =>
                  import('app/pages/threat-context/attack-patterns/attack-patterns.module').then(
                    (m) => m.AttackPatternsModule
                  )
              },
              {
                path: 'threat_context/campaigns',
                loadChildren: () =>
                  import('app/pages/threat-context/campaigns/campaigns.module').then((m) => m.CampaignsModule)
              },
              {
                path: 'threat_context/actors',
                loadChildren: () =>
                  import('app/pages/threat-actors/threat-actors.module').then((m) => m.ThreatActorsModule)
              },
              { path: 'resource/malwareOld/:id', component: DetailsMalwareComponent },
              // {
              //   path: 'settings',
              //   component: ModuleSettingsComponent,
              //   children: [
              //     { path: '', component: ParameterSettingsComponent },
              //     { path: tabSetting.parameters, component: ParameterSettingsComponent },
              //     { path: ':id', component: ModuleSettingsDetailComponent },
              //     {
              //       path: ':settingId/new',
              //       canActivate: [GrantsGuard],
              //       component: ModuleSettingsDetailNewEditComponent
              //     },
              //     { path: ':settingId/:id', component: ModuleSettingsDetailViewComponent }
              //     {
              //       path: ':settingId/:id/edit',
              //       canActivate: [GrantsGuard],
              //       component: ModuleSettingsDetailNewEditComponent
              //     }
              //   ]
              // },
              { path: '**', component: NotFoundComponent }
            ]
          },
          { path: 'create-module-old', canActivate: [GrantsGuard], component: CreateModuleComponent },
          { path: '**', component: NotFoundComponent }
        ]
      }
    ]
  },
  { path: 'login', component: EmptyComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    loadChildren: () => import('app/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: 'emptyGrants', component: EmptyGrantsComponent, canActivate: [AuthGuard] },
  { path: 'notFound', component: NotFoundComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];

export const routing = RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' });
