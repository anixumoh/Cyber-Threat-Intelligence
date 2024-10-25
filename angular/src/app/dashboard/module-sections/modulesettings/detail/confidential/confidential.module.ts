import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfidentialComponent } from './confidential.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, CommonModule, RouterModule, TooltipModule, NgbModule],
  declarations: [ConfidentialComponent],
  providers: [],
  bootstrap: [ConfidentialComponent],
  exports: [ConfidentialComponent],
})
export class ConfidentialModule {}
