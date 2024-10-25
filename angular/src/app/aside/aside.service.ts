import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class AsideService {
  dataSubject = new Subject();

  openDrawerSubject = new BehaviorSubject<boolean>(false);
  idAdvanced = new BehaviorSubject<number>(undefined);
  templateType = new BehaviorSubject<string>('');

  constructor() {}

  setData(dataForAside) {
    this.dataSubject.next(dataForAside);
  }

  getDataObs(): Observable<any> {
    return this.dataSubject.asObservable().pipe(filter(Boolean));
  }

  setShowAsideSubject(dataForComponent: string, id: number) {
    this.openDrawerSubject.next(!this.openDrawerSubject.getValue());
    if (this.openDrawerSubject.getValue()) {
      if (id) {
        this.idAdvanced.next(id);
      }
      this.templateType.next(dataForComponent);
    }
  }

  reset() {
    this.openDrawerSubject.next(false);
  }
}
