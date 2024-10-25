import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndicatorsComponent } from './list/indicators.component';
import { AuthGuard } from '../../../services/guards/auth-guard.service';
import { IndicatorsDetailsComponent } from './details/indicators-details.component';

const routes: Routes = [
  {
    path: '',
    component: IndicatorsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':indicatorType/resource/:indicatorId',
    component: IndicatorsDetailsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndicatorsRoutingModule {}
