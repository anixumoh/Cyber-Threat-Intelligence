import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { SharedAdminModule } from '../shared/shared.module';
import { UserListComponent } from './users/user-list.component';
import { AdminUsersComponent } from './users/list-users/admin-users.component';
import { AdminGroupsComponent } from './users/list-groups/admin-groups.component';
import { NewEditGroupsComponent } from './new-edit-groups/new-edit-groups.component';
import { NewEditUsersComponent } from './new-edit-users/new-edit-users.component';
import { UsersService } from './users.service';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { OrganizationService } from '../organization/organization.service';
import { AppUtilsModule } from 'app/utils/utils.module';

const routes: Routes = [{ path: '', component: UserListComponent }];

@NgModule({
  imports: [CommonModule, SharedAdminModule, AppUtilsModule],
  declarations: [
    UserListComponent,
    AdminUsersComponent,
    AdminGroupsComponent,
    NewEditGroupsComponent,
    NewEditUsersComponent,
    UserDetailComponent,
    GroupDetailComponent,
  ],
  providers: [UsersService, OrganizationService],
})
export class UsersModule {}

@NgModule({
  imports: [RouterModule.forChild(routes), UsersModule],
  exports: [RouterModule],
})
export class UsersRouting {}
