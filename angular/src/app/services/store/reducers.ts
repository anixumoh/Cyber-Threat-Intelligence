import { Injectable } from '@angular/core';
import { LabelsFactory } from 'app/dashboard/module-sections/shared/labels/labelsFactory';
import { ResourcesFactory } from 'app/services/resourcesFactory';
import { AccountFactory } from 'app/dashboard/user/accountFactory';

@Injectable()
export class Reducers {
  constructor(
    private labelsFactory: LabelsFactory,
    private resourcesFactory: ResourcesFactory,
    private accountFactory: AccountFactory
  ) {}

  format(dataSet, action, payload = null, dependency = []) {
    switch (action) {
      case 'resetLabels': {
        return this.labelsFactory.resetLabels(dataSet);
      }
      case 'onSearchLabel': {
        return this.labelsFactory.searchLabel(dataSet, payload);
      }
      case 'onToggleLabel': {
        return this.labelsFactory.toggleLabel(dataSet, payload);
      }
      case 'onToggleMultipleLabels': {
        return this.labelsFactory.toggleMultipleLabels(dataSet, payload);
      }
      case 'unshiftLabel': {
        return this.labelsFactory.unshiftLabel(dataSet, payload);
      }
      case 'updateLabel': {
        return this.labelsFactory.updateLabel(dataSet, payload);
      }
      case 'sliceLabel': {
        return this.labelsFactory.sliceLabel(dataSet, payload);
      }
      case 'checkLabelsOnSelectedResources': {
        return this.labelsFactory.checkOnSelectedResources(dataSet, dependency);
      }
      case 'resetResources': {
        return this.resourcesFactory.resetResources(dataSet);
      }
      case 'checkResources': {
        return this.resourcesFactory.checkResources(dataSet, payload);
      }
      case 'assignLabels': {
        return this.resourcesFactory.assignLabels(dataSet, dependency);
      }
      case 'deleteState': {
        return this.accountFactory.deleteState(dataSet, payload);
      }
      case 'setRoles': {
        return this.accountFactory.setRoles(dataSet, payload);
      }
      case 'newModule': {
        return this.accountFactory.newModule(dataSet, payload);
      }
      default: {
        return dataSet;
      }
    }
  }
}
