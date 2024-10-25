import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BankComponent } from './bank.component';
import { BankService } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.service';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule],
  declarations: [BankComponent],
  providers: [BankService],
  bootstrap: [BankComponent],
  exports: [BankComponent],
})
export class BankModule {}
