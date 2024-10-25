import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeverityComponent } from './severity.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SeverityComponent],
  providers: [],
  exports: [SeverityComponent]
})

export class SeverityModule {}
