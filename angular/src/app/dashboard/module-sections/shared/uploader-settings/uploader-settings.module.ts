import { NgModule } from '@angular/core';
import { UploaderSettingsComponent } from './uploader-settings.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, CommonModule, RouterModule],
  declarations: [UploaderSettingsComponent],
  providers: [],
  bootstrap: [UploaderSettingsComponent],
  exports: [UploaderSettingsComponent],
})
export class UploaderSettingsModule {}
