import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../services/guards/auth-guard.service';
import { ThreatActorsListComponent } from './list/threat-actors-list.component';
import { ThreatActorsDetailsComponent } from './details/threat-actors-details.component';

const routes: Routes = [
	{
		path: '',
		component: ThreatActorsListComponent,
		canActivate: [AuthGuard]
	},
	{
		path: ':actorId',
		component: ThreatActorsDetailsComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ThreatActorsRoutingModule {}
