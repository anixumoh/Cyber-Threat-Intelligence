import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileMenuComponent } from './profile-menu.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ProfileMenuComponent],
  exports: [ProfileMenuComponent],
})
export class ProfileMenuModule {}
