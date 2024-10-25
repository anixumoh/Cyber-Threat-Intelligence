import { Component, Input, EventEmitter, Output, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { LabelService } from './labels.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';

const { flatten, countBy, clone, isEmpty } = _;

@Component({
  selector: 'app-table-tools-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent implements OnInit, OnDestroy {
  isMenuOpened = false;
  addLabelBool = false;
  editLabelBool = false;
  search = '';
  isEmpty: Function = isEmpty;
  itemToEdit: any;
  public newLabelColor = '#f6f4f4';
  defaultLabelText = 'Text inside label';
  public newLabelTextColor = '#2aae4c';
  public newLabelName = '';
  selectedLabelsToAdd = [];
  selectedLabelsInTable;
  selectedItemsLength;
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  currentModuleSubscription: Subscription;
  subscriptionList = [];

  @Input() changes = {};
  @Input() loading = false;
  @Input() labelItems;
  @Input() existLabel = true;
  @Input() set items(its) {
    const selectedItems = its.filter((x) => x.checked);

    this.selectedItemsLength = selectedItems.length;
    this.selectedLabelsInTable = countBy(flatten(selectedItems.map((x) => x.labels)), 'name');
  }

  @Output() onClickItem = new EventEmitter();
  @Output() searchLabel = new EventEmitter();
  @Output() onChangeLabels = new EventEmitter();
  @Output() onClickApply = new EventEmitter();

  constructor(private el: ElementRef, private lcs: LabelService, private organizationService: OrganizationService) {}

  ngOnInit() {
    const s = this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
    this.subscriptionList.push(s);
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((s) => {
      if (s.unsubscribe) {
        s.unsubscribe();
      }
    });
  }

  toggleMenu(value = !this.isMenuOpened) {
    this.isMenuOpened = value;
    this.onChangeLabels.emit({});
    this.searchLabel.emit('');
    this.search = '';
    this.itemToEdit = {};
    this.addLabelBool = false;
    this.editLabelBool = false;
  }

  addLabelToggle() {
    this.addLabelBool = !this.addLabelBool;
    this.isMenuOpened = true;
  }

  editLabelToggle() {
    this.editLabelBool = !this.editLabelBool;
    this.isMenuOpened = true;
    if (!this.editLabelBool) {
      this.itemToEdit = {};
    }
  }

  isIndeterminate(labelName) {
    return this.selectedLabelsInTable[labelName] < this.selectedItemsLength;
  }

  isChecked(labelName) {
    return this.selectedLabelsInTable[labelName] && this.selectedLabelsInTable[labelName] > 0;
  }

  clickItem(item) {
    this.onClickItem.emit(item);
  }

  onChangeCheckbox(it, event) {
    const isChecked = this.isChecked.call(this, it.label);
    const isIntermediate = this.isIndeterminate.call(this, it.label);
    const changes_temp = clone(this.changes);

    if (
      (isChecked && !isIntermediate && !changes_temp[it.id]) ||
      (isChecked && isIntermediate && changes_temp[it.id] && changes_temp[it.id].state === 'add')
    ) {
      changes_temp[it.id] = { state: 'delete', name: it.label };
    } else if (
      (isChecked && !isIntermediate && changes_temp[it.id]) ||
      (isChecked && isIntermediate && changes_temp[it.id] && changes_temp[it.id].state === 'delete') ||
      (!isChecked && !isIntermediate && changes_temp[it.id] && changes_temp[it.id].state === 'add')
    ) {
      delete changes_temp[it.id];
    } else if (
      (isChecked && isIntermediate && !changes_temp[it.id]) ||
      (!isChecked && !isIntermediate && !changes_temp[it.id])
    ) {
      changes_temp[it.id] = { state: 'add', name: it.label };
    }
    this.selectedLabelsToAdd = Object.keys(changes_temp);
    if (this.selectedLabelsToAdd.length == 1) {
      this.itemToEdit = it;
    } else {
      this.editLabelBool = this.editLabelBool ? !this.editLabelBool : this.editLabelBool;
      this.itemToEdit = {};
    }
    this.onChangeLabels.emit(changes_temp);
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      // this.isMenuOpened = false;
    }
  }

  submitNewLabel(type) {
    if (this.activeModule) {
      if (type == 'create' && this.newLabelName) {
        this.lcs
          .createLabel(
            this.newLabelName,
            this.newLabelTextColor,
            this.newLabelColor,
            this.activeModule.id,
            this.activeOrganization.id
          )
          .subscribe(
            (data) => this.addNewLabelToActualItems(data),
            (error) => console.log(error)
          );
      } else if (type == 'update') {
        this.lcs
          .editLabel(
            this.itemToEdit.id,
            this.itemToEdit.label,
            this.itemToEdit.textColor,
            this.itemToEdit.bgColor,
            this.activeModule.id,
            this.activeOrganization.id
          )
          .subscribe(
            (data) => this.updateLabelOnActualItems(data),
            (error) => console.log(error)
          );
      }
    }
  }

  addNewLabelToActualItems(label) {
    const nl = {
      id: label.id,
      bgColor: this.newLabelColor,
      label: label.label,
      textColor: this.newLabelTextColor
    };
    this.labelItems.push(nl);
    this.sortLabels();
    this.addLabelToggle();
    this.onChangeCheckbox(nl, null);
  }

  updateLabelOnActualItems(label) {
    const nl = {
      id: label.id,
      bgColor: this.itemToEdit.bgColor,
      label: this.itemToEdit.label,
      textColor: this.itemToEdit.textColor
    };
    this.substituteLabels(nl);
    this.sortLabels();
    this.onChangeCheckbox(nl, null);
  }

  sortLabels() {
    this.labelItems.sort((a, b) => {
      if (a.label < b.label) return -1;
      else if (a.label > b.label) return 1;
      else return 0;
    });
  }

  substituteLabels(label) {
    for (var i = 0; i < this.labelItems.length; i++) {
      if (this.labelItems[i].id == label.id) {
        this.labelItems[i] = label;
      }
    }
  }

  getHexadecimalColor(color) {
    return color;
  }

  applyLabel() {
    this.isMenuOpened = false;
    this.onClickApply.emit();
  }
}
