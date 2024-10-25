import { NgModule } from '@angular/core';
import { TcxLinkeableComponent } from './tcx-linkeable.component';
import { TcxLinkeableService } from './tcx-linkeable.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [TcxLinkeableComponent],
  providers: [TcxLinkeableService],
  exports: [TcxLinkeableComponent],
})
export class TcxLinkeableModule {}
