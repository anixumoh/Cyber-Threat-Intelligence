import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TlpComponent } from './tlp.component';
import { TlpService } from './tlp.service';

@NgModule({
  imports: [FormsModule, NgbModule,CommonModule],
  declarations: [TlpComponent],
  providers: [TlpService],
  bootstrap: [TlpComponent],
  exports: [TlpComponent]
})

export class TlpModule {}
