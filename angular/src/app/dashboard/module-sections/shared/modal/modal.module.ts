import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { DorksTemplateComponent } from './dorks-template/dorks-template.component';
import { ModalService } from 'app/dashboard/module-sections/shared/modal/modal.service';
import { TooltipModule } from 'ngx-tooltip';
import { DorksThreatContextTemplateComponent } from './dorks-threat-context-template/dorks-threat-context-template.component';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, TooltipModule],
  declarations: [ModalComponent, DorksTemplateComponent, DorksThreatContextTemplateComponent],
  providers: [ModalService],
  bootstrap: [ModalComponent],
  exports: [ModalComponent],
})
export class ModalModule {}
