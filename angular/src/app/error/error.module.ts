import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from 'app/error/error.component';
import { ErrorService } from 'app/error/error.service'

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ErrorComponent,
  ],
  exports: [
    ErrorComponent
  ],
  providers: [ ErrorService ]
})
export class ErrorModule { }
