import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeedsComponent } from "app/dashboard/module-sections/modulesettings/detail/feeds/feeds.component";
import { FeedsService } from "app/dashboard/module-sections/modulesettings/detail/feeds/feeds.service";
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule
  ],
  declarations: [FeedsComponent],
  providers: [FeedsService],
  bootstrap: [FeedsComponent],
  exports: [FeedsComponent]
})

export class FeedsModule { }
