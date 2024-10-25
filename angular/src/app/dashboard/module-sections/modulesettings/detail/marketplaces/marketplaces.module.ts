import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplacesComponent } from './marketplaces.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule],
  declarations: [MarketplacesComponent],
  providers: [],
  bootstrap: [MarketplacesComponent],
  exports: [MarketplacesComponent],
})
export class MarketplacesModule {}
