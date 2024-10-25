import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { InformComponent } from './inform.component';
import { InformService } from './inform.service';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule],
  declarations: [InformComponent],
  providers: [InformService],
  bootstrap: [InformComponent],
  exports: [InformComponent]
})

export class InformModule {}
