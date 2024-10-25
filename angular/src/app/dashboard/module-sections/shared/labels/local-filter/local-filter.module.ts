import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalFilterComponent } from './local-filter.compontent';

@NgModule({
  declarations: [ LocalFilterComponent ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [ LocalFilterComponent ],
  providers: [ ],
})
export class LocalFilterModule { }
