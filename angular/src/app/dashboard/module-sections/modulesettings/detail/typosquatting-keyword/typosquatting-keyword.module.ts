import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TyposquattingKeywordComponent } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting-keyword/typosquatting-keyword.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [TyposquattingKeywordComponent],
  providers: [],
  bootstrap: [TyposquattingKeywordComponent],
  exports: [TyposquattingKeywordComponent],
})
export class TyposquattingKeywordModule {}
