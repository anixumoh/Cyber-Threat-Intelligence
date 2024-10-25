import { Component, OnDestroy, OnInit } from '@angular/core';
import { GenericParameterComponent } from '../generic-parameter/generic-parameter.component';
import { TyposquattingDistance } from './typosquatting-distance';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { GenericParameter } from '../generic-parameter/generic-parameter';
import { TyposquattingDistanceParameter } from './typosquatting-distance-parameter';
import { Grants } from '../../../../../../../services/grants/grants';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export function typosquattingDistanceFactory(
  moduleSettingsDetailService: ModuleSettingsDetailService,
  parameterObject: TyposquattingDistanceParameter
) {
  return new TyposquattingDistance(moduleSettingsDetailService, parameterObject);
}

@Component({
  selector: 'app-typosquatting-distance',
  templateUrl: './typosquatting-distance.component.html',
  styleUrls: ['./typosquatting-distance.component.scss'],
  providers: [
    TyposquattingDistanceParameter,
    { provide: GenericParameter, useExisting: TyposquattingDistanceParameter },
    {
      provide: TyposquattingDistance,
      useFactory: typosquattingDistanceFactory,
      deps: [ModuleSettingsDetailService, TyposquattingDistanceParameter]
    }
  ]
})
export class TyposquattingDistanceComponent extends GenericParameterComponent implements OnDestroy, OnInit {
  openForm = false;
  sendRequest$ = new Subject();
  private readonly destroy$ = new Subject<void>();

  constructor(
    public parameterObject: GenericParameter,
    public typosquattingDistanceObj: TyposquattingDistance,
    public grants: Grants
  ) {
    super(parameterObject, grants);
  }

  ngOnInit(): void {
    this.initSubject();
  }

  ngOnDestroy() {
    this.typosquattingDistanceObj.unsubscribe();
  }

  onKeydown(event) {
    event.keyCode != 38 && event.keyCode != 40 && event.preventDefault();
  }

  initSubject() {
    this.sendRequest$
      .pipe(takeUntil(this.destroy$), debounceTime(1500))
      .subscribe(({ value, event }) => this.setDistanceUpdate(value, event));
  }

  debounceSend(value: any, event: any) {
    this.sendRequest$.next({ value, event });
  }

  maxDistance(distance) {
    return this.typosquattingDistanceObj.maxDistance(distance);
  }

  setDistanceUpdate(element, event) {
    this.typosquattingDistanceObj.setDistanceUpdate(element, event);
  }

  renderValue(value) {
    return value.value.split('~')[0];
  }

  openDeleteAllConfirmationModal() {
    this.deleteAllConfirmation = true;
  }

  showAdd() {
    this.openForm = !this.openForm;
  }
}
