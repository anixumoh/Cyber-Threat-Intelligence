import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilenameComponent } from './filename.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [FilenameComponent],
  providers: [],
  bootstrap: [FilenameComponent],
  exports: [FilenameComponent],
})
export class FilenameModule {}
