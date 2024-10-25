import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnableDisableComponent } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.component';

@NgModule({
  imports: [CommonModule],
  declarations: [EnableDisableComponent],
  providers: [],
  exports: [EnableDisableComponent]
})

export class EnableDisableModule {}
