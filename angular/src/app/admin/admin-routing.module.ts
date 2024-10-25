import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from 'app/admin/admin/admin.component';

export const adminRoute: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'orgs',
        loadChildren: () => import('app/admin/organization/organization.module').then((m) => m.OrganizationRouting),
        data: {
          name: 'Organizations',
          icon: 'icon-sitemap-solid',
          url: 'orgs',
          roles: ['Master', 'Superadmin', 'Admin', 'Analyst']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoute)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
