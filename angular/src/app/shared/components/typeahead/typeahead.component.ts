import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TypeaheadComponent {
  @Input() model: (search) => Observable<any>;
  @Input() typeaheadOptionField = 'name';
  @Input() buttonText = 'Add';
  @Input() buttonDisabled = false;
  @Output() submit = new EventEmitter();

  selected;
  selectedItem;
  typeaheadLoading: boolean;
  dataSource: Observable<any>;

  constructor() {
    this.dataSource = new Observable((observer: any) => {
      observer.next(this.selected);
    }).pipe(
      debounceTime(1500),
      mergeMap((token: string) => this.getStatesAsObservable(token))
    );
  }

  getStatesAsObservable(token: string): Observable<any> {
    return this.model(token);
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.selectedItem = e.item;
  }

  onSubmit() {
    this.submit.emit(this.selectedItem);
  }
}
