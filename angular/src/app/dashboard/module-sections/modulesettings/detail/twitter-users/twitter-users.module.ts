import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TwitterUsersComponent } from 'app/dashboard/module-sections/modulesettings/detail/twitter-users/twitter-users.component';
import { TooltipModule } from 'ngx-tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, RouterModule, TooltipModule, NgbModule],
  declarations: [TwitterUsersComponent],
  providers: [],
  bootstrap: [TwitterUsersComponent],
  exports: [TwitterUsersComponent],
})
export class TwitterUsersModule {}
