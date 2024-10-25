import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MoreComponent } from './more.component';

@NgModule({
  imports: [FormsModule, NgbModule,CommonModule],
  declarations: [MoreComponent],
  providers: [],
  bootstrap: [MoreComponent],
  exports: [MoreComponent]
})

export class MoreModule {}
