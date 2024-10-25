import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RssCategoriesComponent } from './rss-categories.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [RssCategoriesComponent],
  providers: [],
  bootstrap: [RssCategoriesComponent],
  exports: [RssCategoriesComponent],
})
export class RssCategoriesModule {}
