import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import {ModalTwoStepValidationComponent} from './modal-two-step-validation.component';
import {ModalTwoStepValidationService} from './modal-two-step-validation.service';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, ModalModule],
  declarations: [ModalTwoStepValidationComponent],
  providers: [ModalTwoStepValidationService],
  bootstrap: [ModalTwoStepValidationComponent],
  exports: [ModalTwoStepValidationComponent]
})

export class ModalTwoStepValidationModule {}
