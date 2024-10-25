import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateModuleComponent } from './create-module.component';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FormsModule, MatStepperModule, MatSlideToggleModule, NgbModule],
  declarations: [CreateModuleComponent]
})
export class CreateModuleModule {}
