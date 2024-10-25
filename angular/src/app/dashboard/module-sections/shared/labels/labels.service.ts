import { tap, map } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Store } from 'app/services/store/store';
import { ResourcesService } from 'app/services/resources.service';

@Injectable()
export class LabelsService implements OnDestroy {
  activeModule: any;
  activeOrganization: any;
  contextOservable: Subscription;
  labelsServiceSubject = new Subject();

  constructor(
    private httpUtils: HttpUtilsService,
    private organizationService: OrganizationService,
    private store: Store,
    private resourcesService: ResourcesService
  ) {
    this.contextOservable = this.organizationService.getCurrentContext().subscribe((context) => {
      if (context && context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }

  ngOnDestroy() {
    if (this.contextOservable) {
      this.contextOservable.unsubscribe();
    }
  }

  resetLabels() {
    this.store.update('labelsList', 'resetLabels', {});
  }

  toggle(event: any) {
    this.store.update('labelsList', 'onToggleLabel', { event });
  }

  toggleMultiple(labels: any) {
    this.store.update('labelsList', 'onToggleMultipleLabels', labels);
  }

  onSearchLabel(labelToSearch) {
    this.store.update('labelsList', 'onSearchLabel', { labelToSearch });
  }

  assignLabels() {
    this.store.update('resourcesList', 'assignLabels', null, 'labelsList');
    const s = this.store.select('resourcesList').subscribe((dataSet: any) => {
      if (dataSet.updateLabels) {
        dataSet.updateLabels.forEach((r) => {
          this.updateLabels(r);
        });
      }
    });
    s.unsubscribe();
  }

  updateLabels(toUpdate) {
    const resource = toUpdate.resource;
    const toAdd = toUpdate.toAdd;
    const toRemove = toUpdate.toRemove;
    const toModify = toAdd.concat(toRemove);
    toModify.forEach((l) => {
      this.resourcesService
        .editLabels(this.activeModule.id, this.activeModule.moduleName, l, [resource.id.toString()])
        .subscribe();
    });
  }

  checkSelectedLabels() {
    this.store.update('labelsList', 'checkLabelsOnSelectedResources', null, 'resourcesList');
  }

  //right now it is not doing what it is supposed to do with the store pattern
  filterByLabel() {
    this.labelsServiceSubject.next();
  }

  //right now it is not doing what it is supposed to do with the store pattern
  getFilterByLabel() {
    return this.labelsServiceSubject.asObservable();
  }

  getLabels(associatedOnly) {
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/label?associated=${associatedOnly}`;
    return this.get(allPath).pipe(
      map((next) => {
        this.store.set('labelsList', next);
      })
    );
  }

  createLabel(label): Observable<any> {
    const selected = Number(label.labelTypeId);
    if (selected === 2) {
      label.moduleId = this.activeModule.id;
    }
    if (selected !== 0) {
      label.organizationId = this.activeOrganization.id;
    }

    return this.httpUtils.post(`${path}/label`, label).pipe(
      tap((res: any) => {
        res.selected = true;
        this.store.update('labelsList', 'unshiftLabel', res);
      })
    );
  }

  updateLabel(label): Observable<any> {
    const obj = {
      label: label.label,
      labelTypeId: label.labelTypeId,
      bgColorHex: label.bgColorHex,
      textColorHex: label.textColorHex,
      prioritized: label.prioritized,
      labelProtected: label.labelProtected,
      organizationId: label.organizationId
    };
    return this.httpUtils.put(`${path}/label/${label.id}`, obj).pipe(
      tap((res: any) => {
        this.store.update('labelsList', 'updateLabel', res);
      })
    );
  }

  deleteLabel(label): Observable<any> {
    return this.httpUtils.delete(`${path}/organization/${this.activeOrganization.id}/label/${label.id}`).pipe(
      tap(() => {
        this.store.update('labelsList', 'sliceLabel', label);
      })
    );
  }

  private get(allPath): Observable<any> {
    return this.httpUtils.get(allPath);
  }
}
