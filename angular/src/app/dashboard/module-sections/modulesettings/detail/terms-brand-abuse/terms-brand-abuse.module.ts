import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { TermsBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse.component';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PaginationModule,
    EnableDisableModule,
    TooltipModule,
    NgbModule,
    ModalModule,
  ],
  declarations: [TermsBrandAbuseComponent],
  providers: [],
  exports: [TermsBrandAbuseComponent],
})
export class TermsBrandAbuseModule {}
