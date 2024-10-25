import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../services/guards/auth-guard.service';
import { ToolsListComponent } from './list/tools-list.component';
import { ToolsDetailsComponent } from './details/tools-details.component';

const routes: Routes = [
  {
    path: '',
    component: ToolsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':toolId',
    component: ToolsDetailsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsRoutingModule {}
