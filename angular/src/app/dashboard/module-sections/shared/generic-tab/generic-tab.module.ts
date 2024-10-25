import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { GenericTabComponent } from './generic-tab.component';

@NgModule({
  declarations: [GenericTabComponent],
  imports: [CommonModule],
  exports: [GenericTabComponent]
})

export class GenericTabModule { }
