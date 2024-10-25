import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttackPatternsRoutingModule } from './attack-patterns-routing.module';
import { AttackPatternsListComponent } from './list/attack-patterns-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { FormsModule } from '@angular/forms';
import { InfoButtonModule } from '../../../dashboard/module-sections/shared/info-button/info-button.module';
import { TlpModule } from '../../../dashboard/module-sections/shared/table/table-tools/tlp/tlp.module';
import { AttackPatternsDetailsComponent } from './details/attack-patterns-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    AttackPatternsRoutingModule,
    SharedModule,
    ModalModule,
    FormsModule,
    InfoButtonModule,
    TlpModule,
    NgbModule,
  ],
  declarations: [AttackPatternsListComponent, AttackPatternsDetailsComponent],
})
export class AttackPatternsModule {}
