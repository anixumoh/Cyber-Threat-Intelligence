import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TyposquattingComponent } from './typosquatting.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [TyposquattingComponent],
  providers: [],
  bootstrap: [TyposquattingComponent],
  exports: [TyposquattingComponent],
})
export class TyposquattingModule {}
