import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServerFilterComponent } from './server-filter.compontent';

@NgModule({
  declarations: [ ServerFilterComponent ],
  imports: [
    CommonModule
  ],
  exports: [ ServerFilterComponent ],
  providers: [ ],
})
export class ServerFilterModule { }
