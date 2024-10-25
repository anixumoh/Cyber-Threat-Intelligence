import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from 'app/page-not-found/page-not-found.component';
import { RouterModule } from '@angular/router';
import { ErrorModule } from 'app/error/error.module';

@NgModule({
  imports: [CommonModule, RouterModule, ErrorModule],
  declarations: [NotFoundComponent],
  exports: [NotFoundComponent]
})
export class NotFoundModule {}
