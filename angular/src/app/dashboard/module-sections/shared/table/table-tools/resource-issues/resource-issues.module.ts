import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ResourceIssuesComponent } from './resource-issues.component';
import { SharedModule } from '../../../../../../shared/shared.module';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, SharedModule],
  declarations: [ResourceIssuesComponent],
  providers: [],
  bootstrap: [ResourceIssuesComponent],
  exports: [ResourceIssuesComponent],
})
export class ResourceIssuesModule {}
