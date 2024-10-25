import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchDropdownComponent } from './search-dropdown.component';

@NgModule({
  imports: [FormsModule, CommonModule],
  declarations: [SearchDropdownComponent],
  exports: [SearchDropdownComponent]
})
export class SearchDropdownModule {}
