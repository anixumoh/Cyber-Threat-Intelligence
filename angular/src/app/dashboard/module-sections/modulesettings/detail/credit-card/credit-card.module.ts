import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreditCardComponent } from 'app/dashboard/module-sections/modulesettings/detail/credit-card/credit-card.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule],
  declarations: [CreditCardComponent],
  providers: [],
  bootstrap: [CreditCardComponent],
  exports: [CreditCardComponent],
})
export class CreditCardModule {}
