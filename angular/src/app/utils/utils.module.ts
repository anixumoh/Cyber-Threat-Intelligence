import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './filter.pipe';
import { GetKeyPipe } from './get-key.pipe';
import { TimezonePipe } from './date.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [GetKeyPipe, FilterPipe, TimezonePipe],
  exports: [GetKeyPipe, FilterPipe, TimezonePipe],
})
export class AppUtilsModule {}
