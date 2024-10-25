import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../services/guards/auth-guard.service';
import { AttackPatternsListComponent } from './list/attack-patterns-list.component';
import { AttackPatternsDetailsComponent } from './details/attack-patterns-details.component';

const routes: Routes = [
  {
    path: '',
    component: AttackPatternsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':attackPatternsId',
    component: AttackPatternsDetailsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttackPatternsRoutingModule {}
