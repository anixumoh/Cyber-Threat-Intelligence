import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HacktivismRssComponent } from 'app/dashboard/module-sections/modulesettings/detail/hacktivism-rss/hacktivism-rss.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [HacktivismRssComponent],
  providers: [],
  bootstrap: [HacktivismRssComponent],
  exports: [HacktivismRssComponent],
})
export class HacktivismRssModule {}
