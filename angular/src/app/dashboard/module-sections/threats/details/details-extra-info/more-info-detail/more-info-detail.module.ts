import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoreInfoDetailComponent } from 'app/dashboard/module-sections/threats/details/details-extra-info/more-info-detail/more-info-detail.component';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { AppUtilsModule } from 'app/utils/utils.module';
import { SharedAdminModule } from 'app/admin/shared/shared.module';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [CommonModule, ModalModule, AppUtilsModule, SharedAdminModule, SharedModule],
  declarations: [MoreInfoDetailComponent],
  exports: [MoreInfoDetailComponent]
})
export class MoreInfoDetailModule {}
