import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FileExtensionComponent } from './file_extension.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, RouterModule, CommonModule],
  declarations: [FileExtensionComponent],
  providers: [],
  bootstrap: [FileExtensionComponent],
  exports: [FileExtensionComponent],
})
export class FileExtensionModule {}
