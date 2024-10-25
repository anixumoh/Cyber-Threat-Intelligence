import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertsAsideComponent } from './alerts-aside.component';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule
  ],
  declarations: [AlertsAsideComponent],
  exports: [AlertsAsideComponent]
})

export class AlertsAsideModule { }