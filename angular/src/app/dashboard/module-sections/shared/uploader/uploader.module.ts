import { NgModule } from '@angular/core';
import { UploaderComponent } from './uploader.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, CommonModule, NgbTooltipModule],
  declarations: [UploaderComponent],
  providers: [],
  exports: [UploaderComponent],
})
export class UploaderModule {}
