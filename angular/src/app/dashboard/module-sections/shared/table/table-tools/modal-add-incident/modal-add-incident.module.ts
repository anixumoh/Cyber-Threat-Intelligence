import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalAddIncidentComponent } from './modal-add-incident.component';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { ModalAddIncidentService } from './modal-add-incident.service';
import { SharedModule } from '../../../../../../shared/shared.module';
import { SharedAdminModule } from 'app/admin/shared/shared.module';
import { SearchDropdownModule } from '../../../search-dropdown/search-dropdown.module';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, ModalModule, SharedModule, SharedAdminModule, SearchDropdownModule],
  declarations: [ModalAddIncidentComponent],
  providers: [ModalAddIncidentService],
  bootstrap: [ModalAddIncidentComponent],
  exports: [ModalAddIncidentComponent]
})
export class ModalAddIncidentModule {}
