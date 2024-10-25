import { Component, Input } from '@angular/core';

@Component({
  selector: 'is-data-is-loading',
  templateUrl: './is-data-is-loading.component.html',
  styleUrls: ['./is-data-is-loading.component.scss']
})
export class IsDataIsLoadingComponent {
  @Input() isLoading = false;
  @Input() errorMsj = 'There are no resources';

  constructor() {}
}
