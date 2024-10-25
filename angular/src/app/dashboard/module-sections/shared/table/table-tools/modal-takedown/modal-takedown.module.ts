import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import {ModalTakedownComponent} from './modal-takedown.component';
import {ModalTakedownService} from './modal-takedown.service';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, ModalModule],
  declarations: [ModalTakedownComponent],
  providers: [ModalTakedownService],
  bootstrap: [ModalTakedownComponent],
  exports: [ModalTakedownComponent]
})

export class ModalTakedownModule {}
