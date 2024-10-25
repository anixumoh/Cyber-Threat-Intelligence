import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';

import { InfoButtonComponent } from './info-button.component';
import { InfoButtonService } from './info-button.service';

import { ModalModule } from '../modal/modal.module';


@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    ModalModule,
  ],
  declarations: [InfoButtonComponent],
  providers: [InfoButtonService],
  exports: [InfoButtonComponent]
})

export class InfoButtonModule {
}
