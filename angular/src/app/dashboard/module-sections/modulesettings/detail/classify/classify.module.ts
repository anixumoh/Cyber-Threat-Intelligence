import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClassifyComponent } from './classify.component';
import { TooltipModule } from 'ngx-tooltip';
import { DragulaModule } from 'ng2-dragula';
import { ClassifyService } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.service';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule, TooltipModule, DragulaModule.forRoot(), NgbTooltipModule],
  declarations: [ClassifyComponent],
  providers: [ClassifyService],
  bootstrap: [ClassifyComponent],
  exports: [ClassifyComponent],
})
export class ClassifyModule {}
