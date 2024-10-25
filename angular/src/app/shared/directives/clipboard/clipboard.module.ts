import { NgModule } from '@angular/core';
import { CopyToClipboardDirective } from 'app/shared/directives/clipboard/clipboard.directive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [CopyToClipboardDirective],
  exports: [CopyToClipboardDirective],
  imports: [NgbTooltipModule],
})
export class ClipboardModule {}
