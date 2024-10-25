import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
export interface IErrorObj {
  msj: string;
  count: number | string;
  callback: () => void;
}

@Component({
  selector: 'is-data-is-loading-threats',
  templateUrl: './is-data-is-loading-threats.component.html',
  styleUrls: ['./is-data-is-loading-threats.component.scss']
})
export class IsDataIsLoadingThreatsComponent implements OnDestroy {
  @Input()
  set message(msj) {
    this._messageSub.next(typeof msj === 'object');
    this._msj = msj;
  }
  @Input()
  set isLoading(its) {
    this._isLoading = its;
  }
  @Input()
  set info(its) {
    this._info = its;
  }

  displayMsj = false;
  _isLoading;
  _info;
  private _messageSub = new Subject();
  private _msj: string | IErrorObj = '';
  private readonly destroy$ = new Subject<void>();

  get message(): string | IErrorObj {
    return this._msj;
  }

  get isLoading() {
    return this._isLoading;
  }

  get info() {
    return this._info;
  }

  constructor() {
    this._messageSub.pipe(takeUntil(this.destroy$)).subscribe((isObj: boolean) => {
      this.displayMsj = isObj;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
