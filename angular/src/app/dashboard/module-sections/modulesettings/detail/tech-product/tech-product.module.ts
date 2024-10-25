import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TechProductComponent } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.component';
import { TechProductService } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.service';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule],
  declarations: [TechProductComponent],
  providers: [TechProductService],
  bootstrap: [TechProductComponent],
  exports: [TechProductComponent],
})
export class TechProductModule {}
