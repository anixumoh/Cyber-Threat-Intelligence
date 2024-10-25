import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActSwitchComponent } from './act-switch.component';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [FormsModule, CommonModule, ModalModule, MatSlideToggleModule, MatTooltipModule],
  declarations: [ActSwitchComponent],
  exports: [ActSwitchComponent]
})
export class ActSwitchModule { }
