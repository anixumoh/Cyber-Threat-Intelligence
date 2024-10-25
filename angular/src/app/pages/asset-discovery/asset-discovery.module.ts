import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SharedModule } from '../../shared/shared.module';
import { AssetDiscoveryDiscoveryComponent } from './pages/discovery/asset-discovery-discovery.component';
import { AssetDiscoverySettingsComponent } from './pages/settings/asset-discovery-settings.component';
import { AssetDiscoveryRoutingModule } from './asset-discovery-routing.module';
import { AssetDiscoveryService } from './asset-discovery.service';
import { AssetDiscoveryBoxComponent } from './views/asset-discovery-box.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';

@NgModule({
  declarations: [AssetDiscoveryDiscoveryComponent, AssetDiscoverySettingsComponent, AssetDiscoveryBoxComponent],
  imports: [
    CommonModule,
    SharedModule,
    AssetDiscoveryRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ModalModule,
    MatProgressBarModule
  ],
  providers: [AssetDiscoveryService]
})
export class AssetDiscoveryModule {}
