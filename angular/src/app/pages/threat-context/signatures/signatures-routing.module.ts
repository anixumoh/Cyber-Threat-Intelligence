import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignaturesListComponent } from './list/signatures-list.component';
import { AuthGuard } from '../../../services/guards/auth-guard.service';
import { SignaturesDetailsComponent } from './details/signatures-details.component';

const routes: Routes = [
  {
    path: '',
    component: SignaturesListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':signatureId',
    component: SignaturesDetailsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignaturesRoutingModule {}
