import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileMenuModule } from './profile-menu/profile-menu.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AppUtilsModule } from 'app/utils/utils.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ProfileMenuModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    AppUtilsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  exports: [ProfileMenuModule, FormsModule]
})
export class ToolbarModule {}
