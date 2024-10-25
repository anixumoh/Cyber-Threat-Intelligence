import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignaturesRoutingModule } from './signatures-routing.module';
import { SignaturesListComponent } from './list/signatures-list.component';
import { SignaturesDetailsComponent } from './details/signatures-details.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { SignaturesDescriptionComponent } from './details/description/signatures-description.component';
import { InfoButtonModule } from '../../../dashboard/module-sections/shared/info-button/info-button.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, SignaturesRoutingModule, FormsModule, SharedModule, ModalModule, InfoButtonModule, NgbModule],
  declarations: [SignaturesListComponent, SignaturesDetailsComponent, SignaturesDescriptionComponent],
})
export class SignaturesModule {}
