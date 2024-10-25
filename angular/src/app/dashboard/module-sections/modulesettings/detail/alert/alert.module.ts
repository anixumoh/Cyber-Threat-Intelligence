import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './alert.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule
  ],
  declarations: [AlertComponent],
  providers: [],
  bootstrap: [AlertComponent],
  exports: [AlertComponent]
})

export class AlertModule { }
