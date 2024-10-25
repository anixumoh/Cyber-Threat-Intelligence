import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetDiscoveryDiscoveryComponent } from './pages/discovery/asset-discovery-discovery.component';
import { AssetDiscoverySettingsComponent } from './pages/settings/asset-discovery-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AssetDiscoveryDiscoveryComponent,
  },
  {
    path: 'discovery',
    component: AssetDiscoveryDiscoveryComponent,
  },
  {
    path: 'settings',
    component: AssetDiscoverySettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetDiscoveryRoutingModule {}
