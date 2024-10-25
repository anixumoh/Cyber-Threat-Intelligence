import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { UserAccountService } from './account.service';
import { UsersService } from '../../admin/users/users.service';
import { UserAccountComponent } from './account.component';
import { StatesModel } from 'app/dashboard/organization/models';
import { SharedAdminModule } from '../../admin/shared/shared.module';
import { ClipboardModule } from '../../shared/directives/clipboard/clipboard.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    ModalModule,
    SharedAdminModule,
    ClipboardModule
  ],
  declarations: [UserAccountComponent],
  providers: [UserAccountService, UsersService, StatesModel],
  bootstrap: [UserAccountComponent],
  exports: [UserAccountComponent]
})
export class AccountModule {}
