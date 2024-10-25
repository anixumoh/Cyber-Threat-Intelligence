import { Injectable } from '@angular/core';

@Injectable()
export class LabelsFactory {
  searchLabel(dataSet, payload) {
    let containsLabel = (l) => l.label.toLowerCase().indexOf(payload.labelToSearch.toLowerCase()) > -1;
    let labelsList = dataSet.map((label: any) => {
      if (containsLabel(label)) {
        return {
          ...label,
          noShow: false,
        };
      } else {
        return {
          ...label,
          noShow: true,
        };
      }
    });
    return labelsList;
  }

  toggleLabel(dataSet, payload) {
    let labelsList = dataSet.map((label: any) => {
      if (payload.event.element.id === label.id) {
        return {
          ...label,
          ...payload.event.element,
        };
      } else {
        return label;
      }
    });
    return labelsList;
  }

  toggleMultipleLabels(dataSet, payload) {
    let toggled = [];
    let labelsList = JSON.parse(JSON.stringify(dataSet));
    if (payload) {
      labelsList.forEach((label) => {
        if (payload.filter((e) => e.id === label.id.toString() && e.strict).length > 0) {
          label.selected = true;
          label.strict = true;
          label.excluded = false;
          toggled.push(label);
        } else if (payload.filter((e) => e.id === label.id.toString() && e.excluded).length > 0) {
          label.selected = true;
          label.strict = false;
          label.excluded = true;
          toggled.push(label);
        } else if (payload.filter((e) => e.id === label.id.toString() && !e.strict && !e.excluded).length > 0) {
          label.selected = true;
          label.strict = false;
          label.excluded = false;
          toggled.push(label);
        }
      });
      const updatedLabels = [];
      payload.map((p) => {
        labelsList.map((label, i) => {
          if (p.id.toString() === label.id.toString()) {
            label.selected = true;
            label.strict = p.strict;
            label.excluded = p.excluded;
            updatedLabels.unshift(label);
          } else {
            updatedLabels.push(label);
          }
        });
      });
      const singleLabels = [...new Set(updatedLabels)];
      return singleLabels;
    }
  }

  unshiftLabel(dataSet, payload) {
    let labelsList = [...dataSet];
    labelsList.unshift(payload);
    return labelsList;
  }

  updateLabel(dataSet, payload) {
    let labelsList = dataSet.map((label: any) => {
      if (payload.id === label.id) {
        payload.background_color = payload.bgColor;
        return {
          ...label,
          ...payload,
        };
      } else {
        return label;
      }
    });
    return labelsList;
  }

  sliceLabel(dataSet, payload) {
    let labelsList = dataSet.filter((label: any) => {
      return label.id !== payload.id;
    });
    return labelsList;
  }

  checkOnSelectedResources(dataSet, dependency) {
    dataSet = this.resetLabels(dataSet);
    let repeated = this.getRepeatedLabels(dependency.list);
    let index = 0;
    let indexes = [];
    let labelList = [...dataSet];
    let labels = dataSet.filter((label) => {
      if (repeated.indexOf(label.id) >= 0) {
        indexes.push(index);
        label.selected = true;
        return label;
      }
      index += 1;
    });

    indexes.forEach((index) => {
      labelList.splice(index, 1);
    });

    let tempLabels = labels.concat(labelList);

    return labels.concat(labelList);
  }

  getRepeatedLabels(resources) {
    let res = resources.filter((resource) => {
      return resource.checkbox;
    });
    let labels = [];
    let repeated = [];

    res.forEach((r) => {
      r.labels.forEach((l) => {
        if (labels.indexOf(l.id) > -1) {
          if (repeated.indexOf(l.id) < 0) {
            repeated.push(l.id);
          }
        } else {
          if (labels.indexOf(l.id) < 0) {
            labels.push(l.id);
          }
        }
      });
    });

    if (res.length > 1) {
      return repeated;
    } else {
      return labels;
    }
  }

  resetLabels(dataSet) {
    if (dataSet && dataSet.length > 0) {
      let labelList = dataSet.map((label) => {
        label.selected = false;
        label.noShow = false;
        return label;
      });
      return labelList;
    } else {
      return;
    }
  }
}
