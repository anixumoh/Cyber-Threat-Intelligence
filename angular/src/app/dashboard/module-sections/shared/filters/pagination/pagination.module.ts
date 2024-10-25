import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { PaginationComponent } from './pagination.component';
import { PaginationService } from './pagination.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [PaginationComponent],
  providers: [PaginationService],
  exports: [PaginationComponent]
})
export class PaginationModule { }
