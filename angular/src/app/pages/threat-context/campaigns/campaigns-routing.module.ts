import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../services/guards/auth-guard.service';
import { CampaignsListComponent } from './list/campaigns-list.component';
import { CampaignsDetailsComponent } from './details/campaigns-details.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':campaignId',
    component: CampaignsDetailsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsRoutingModule {}
