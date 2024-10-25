import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { RssBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse.component';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule, PaginationModule, EnableDisableModule],
  declarations: [RssBrandAbuseComponent],
  providers: [],
  exports: [RssBrandAbuseComponent],
})
export class RssBrandAbuseModule {}
