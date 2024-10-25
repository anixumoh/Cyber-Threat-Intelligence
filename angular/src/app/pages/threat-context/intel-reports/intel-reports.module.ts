import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntelReportsRoutingModule } from './intel-reports-routing.module';
import { IntelReportsListComponent } from './list/intel-reports-list.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { InfoButtonModule } from '../../../dashboard/module-sections/shared/info-button/info-button.module';

@NgModule({
  imports: [CommonModule, IntelReportsRoutingModule, FormsModule, SharedModule, ModalModule, InfoButtonModule],
  declarations: [IntelReportsListComponent],
})
export class IntelReportsModule {}
