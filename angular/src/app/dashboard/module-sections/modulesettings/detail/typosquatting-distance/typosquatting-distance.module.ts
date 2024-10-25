import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TyposquattingDistanceComponent } from './typosquatting-distance.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [TyposquattingDistanceComponent],
  providers: [],
  bootstrap: [TyposquattingDistanceComponent],
  exports: [TyposquattingDistanceComponent],
})
export class TyposquattingDistanceModule {}
