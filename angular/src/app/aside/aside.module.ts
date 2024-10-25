import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideComponent } from './aside.component';
import { AsideService } from './aside.service';

@NgModule({
  imports: [CommonModule],
  providers: [AsideService],
  declarations: [AsideComponent],
  exports: [AsideComponent]
})
export class AsideModule {}
