import { NgModule } from '@angular/core';
import { OrganizationComponent } from './organization.component';
import { OrganizationService } from './organization.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateModuleModule } from './create-module/create-module.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [FormsModule, CommonModule, RouterModule, CreateModuleModule, SharedModule],
  declarations: [OrganizationComponent],
  providers: [OrganizationService],
  bootstrap: [OrganizationComponent],
  exports: [OrganizationComponent]
})
export class OrganizationModule {}
