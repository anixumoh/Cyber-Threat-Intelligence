import { Injectable } from '@angular/core';

@Injectable()
export class ResourcesFactory {
  checkResources(dataSet, ids) {
    if (dataSet) {
      let resourcesList = dataSet.list.map((resource: any) => {
        if (ids.indexOf(resource.id) >= 0) {
          resource.checkbox = true;
        } else {
          resource.checkbox = false;
        }
        return resource;
      })
      return { ...dataSet, list: resourcesList };
    } else {
      return dataSet;
    }
  }

  resetResources(dataSet) {
    if (dataSet) {
      let resourcesList = dataSet.list.map((resource: any) => {
        resource.checkbox = false;
        return resource;
      })
      return { ...dataSet, list: resourcesList };
    } else {
      return dataSet;
    }
  }

  assignLabels(dataSet, dependency) {
    let labels = dependency.filter((label: any) => {
      return label.selected;
    });

    let updateLabels = [];
    let initialResources = JSON.parse(JSON.stringify(dataSet.list)).filter(r => { return r.checkbox });
    let commonLabels = this.getCommonLabels(initialResources);
    let resourcesList = dataSet.list.map((resource: any) => {
      if (resource.checkbox) {
        let labelsToAdd = this.addNewLabelsToResource(resource, labels);
        let labelsToRemove = this.removeLabelsFromResource(resource, labels, dependency, commonLabels);
        updateLabels.push({
          resource: resource,
          toAdd: labelsToAdd,
          toRemove: labelsToRemove
        })
      }
      return resource;
    })
    let temp = { ...dataSet, list: resourcesList, updateLabels: updateLabels };
    return temp;
  }

  getCommonLabels(resources) {
    let labels = [];
    let repeatedLabels = [];
    resources.forEach(r => {
      r.labels.forEach(l => {
        if (labels.indexOf(l.id) >= 0) { repeatedLabels.push(l.id) }
        else { labels.push(l.id) }
      });
    })
    return resources.length == 1 ? labels : repeatedLabels;
  }

  addNewLabelsToResource(resource, labels) {
    let resourceLabelIds = resource.labels.map((l) => { return l.id })
    let labelsToAdd = [];
    labels.forEach((label) => {
      if (resourceLabelIds.indexOf(label.id) < 0) {
        resource.labels.push(label);
        labelsToAdd.push(label.id);
      }
    })
    return labelsToAdd;
  }

  removeLabelsFromResource(resource, labels, allLabels, commonLabels) {
    let oldL = resource.labels.map(l => { return l.id });
    let newL = labels.map(l => { return l.id });
    let allL = allLabels.map(l => { return l.id })
    let toRemove = oldL.filter(l => { return newL.indexOf(l) < 0 && allL.indexOf(l) >= 0 && commonLabels.indexOf(l) >= 0 })
    let index = 0;
    let indexes = [];
    resource.labels.forEach(l => {
      if (toRemove.indexOf(l.id) >= 0) { indexes.push(index) }
      index += 1;
    });
    let count = 0;
    indexes.forEach(i => {
      resource.labels.splice(i - count, 1);
      count++;
    })
    return toRemove;
  }
}
