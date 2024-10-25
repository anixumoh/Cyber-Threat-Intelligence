import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorModule } from 'app/error/error.module';
import { EmptyGrantsComponent } from 'app/empty-grants/empty-grants.component';

@NgModule({
  imports: [CommonModule, RouterModule, ErrorModule],
  declarations: [EmptyGrantsComponent],
  exports: [EmptyGrantsComponent]
})
export class EmptyGrantsModule {}
