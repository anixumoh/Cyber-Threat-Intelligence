import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntelReportsListComponent } from './list/intel-reports-list.component';
import { AuthGuard } from '../../../services/guards/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: IntelReportsListComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntelReportsRoutingModule {}
