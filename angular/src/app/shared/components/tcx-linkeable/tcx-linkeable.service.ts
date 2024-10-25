import { of as observableOf, BehaviorSubject, Observable } from 'rxjs';

import { catchError, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ToolsService } from '../../../core/models/tools.service';
import { ActorsService } from '../../../core/models/actors.service';

@Injectable()
export class TcxLinkeableService {
  showModal = new BehaviorSubject({ show: false, type: '' });
  private tools = {};
  private toolsPromises = {};
  private actors = {};
  private actorsPromises = {};

  constructor(private toolsService: ToolsService, private actorsService: ActorsService) {}

  getTool(text: string) {
    if (!this.tools[text]) {
      if (!this.toolsPromises[text]) {
        const promise = new Promise((resolve, reject) => {
          this.toolsService
            .list({ dork: `name:~"${text}"` })
            .pipe(
              take(1),
              catchError(e => observableOf([]))
            )
            .subscribe(response => {
              if (response.data) {
                const items = response.data.map(({ id, attributes }) => ({ id, ...attributes }));
                if (items && items.length > 0) {
                  if (items.length === 1) {
                    this.tools[text] = items[0].id;
                  } else if (items.length > 1) {
                    for (const item of items) {
                      if (item.name.toLowerCase() === text.toLowerCase()) {
                        this.tools[text] = item.id;
                        break;
                      }
                    }
                    if (this.tools[text] === 'undefined') {
                      for (const item of items) {
                        if (item.name.toLowerCase().startsWith(text.toLowerCase())) {
                          this.tools[text] = item.id;
                          break;
                        }
                      }
                    }

                    if (this.tools[text] === 'undefined') {
                      this.tools[text] = items[0].id;
                    }
                  }
                }
                resolve(this.tools[text]);
              }
            });
        });
        this.toolsPromises[text] = promise;
      }
      return this.toolsPromises[text];
    }
    return Promise.resolve(this.tools[text]);
  }

  getActor(name: string) {
    if (!this.actors[name]) {
      if (!this.actorsPromises[name]) {
        const promise = new Promise((resolve, reject) => {
          this.actorsService
            .list({ dork: `name:~"${name}"` })
            .pipe(
              take(1),
              catchError(e => observableOf([]))
            )
            .subscribe(response => {
              if (response.data) {
                const items = response.data.map(({ id, attributes }) => ({ id, ...attributes }));
                if (items && items.length > 0) {
                  if (items.length === 1) {
                    this.actors[name] = items[0].id;
                  } else if (items.length > 1) {
                    for (const item of items) {
                      if (item.name.toLowerCase() === name.toLowerCase()) {
                        this.actors[name] = item.id;
                        break;
                      }
                    }
                    if (this.actors[name] === 'undefined') {
                      for (const item of items) {
                        if (item.name.toLowerCase().startsWith(name.toLowerCase())) {
                          this.actors[name] = item.id;
                          break;
                        }
                      }
                    }

                    if (this.actors[name] === 'undefined') {
                      this.actors[name] = items[0].id;
                    }
                  }
                }
                resolve(this.actors[name]);
              }
            });
        });
        this.actorsPromises[name] = promise;
      }
      return this.actorsPromises[name];
    }
    return Promise.resolve(this.actors[name]);
  }
}
