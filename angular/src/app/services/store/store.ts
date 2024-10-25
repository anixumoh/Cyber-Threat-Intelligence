import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { State } from 'app/services/store/state';
import { Reducers } from 'app/services/store/reducers';

@Injectable()
export class Store {
  state: State = {
    labelsList: undefined,
    resourcesList: undefined,
    userStateList: undefined,
    roleList: undefined
  };

  stateSubjects = {
    labelsList: new BehaviorSubject<any[]>(this.state.labelsList),
    resourcesList: new BehaviorSubject<any[]>(this.state.resourcesList),
    userStateList: new BehaviorSubject<any[]>(this.state.userStateList),
    roleList: new BehaviorSubject<any>(this.state.roleList).pipe(
      filter(Boolean),
      distinctUntilChanged((t) => this.isEqual(t, this.state.roleList))
    )
  };

  private subject = new BehaviorSubject<State>(this.state);
  private store = this.stateSubjects;

  constructor(private reducers: Reducers) {}

  // TO-ANALIZE: asObservable and distinctUntilChanged
  // private store = this.subject.asObservable().distinctUntilChanged();

  get value() {
    return this.subject.value;
  }

  select<T>(name: string): Observable<T> {
    return this.store[name];
  }

  set(name: string, state: any) {
    if (typeof state !== 'undefined') {
      this.store[name].next(JSON.parse(JSON.stringify(state)));
      this.state[name] = state;
    }
  }

  update(dataset: string, action: string, payload: any, dependency = '') {
    const newSet = this.reducers.format(this.state[dataset], action, payload, this.state[dependency] || []);
    this.set(dataset, newSet);
  }

  isEqual(o1, o2) {
    return JSON.stringify(o1) == JSON.stringify(o2);
  }

  reset() {
    this.state = {
      labelsList: undefined,
      resourcesList: undefined,
      userStateList: undefined,
      roleList: undefined
    };
    this.store = this.stateSubjects;
  }
}
