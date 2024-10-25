import { Component, Input, EventEmitter, Output, OnInit, ElementRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { LabelService } from './labels.service';
import { ModulesService } from 'app/services/modules.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel } from 'app/dashboard/organization/models';

const { flatten, countBy, clone, isEmpty, uniq } = _;

@Component({
  selector: 'app-table-tools-result-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class ResultLabelsComponent implements OnInit {
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
  selectedLabels: any[];
  selectedLabelsInTable;
  selectedItemsLength;
  activeModule: ModuleModel;
  currentModuleSubscription: Subscription;
  isCheckedV: boolean;
  isIndeterminateV: boolean;

  _changes = {};
  @Input()
  set changes(its) {
    this._changes = its;
  }

  get changes() {
    return this._changes;
  }

  _loading = false;
  @Input()
  set loading(its) {
    if (its === false) {
      this.isMenuOpened = false;
    }
    this._loading = its;
  }
  get loading() {
    return this._loading;
  }

  @Input() existLabel = true;

  _items: { items: any[]; selectedItems: any[]; labelItems: any[]; source: string };

  @Input() set items(its) {
    if (its.labelItems) {
      this.labelItems = its.labelItems.slice();
      this._items = its;
      let selectedItems = [];
      if (this._items.source === 'details' || this._items.source === 'malware-details') {
        selectedItems = its.items.filter((x) => x.checked);
      } else {
        selectedItems = its.items.filter((item) => {
          let isTrue = false;
          this._items.selectedItems.forEach((selectedItem) => {
            if (!isTrue) {
              isTrue = item.id == selectedItem;
            }
          });
          return isTrue;
        });
      }
      this.selectedItemsLength = selectedItems.length;
      if (this._items.source === 'malware-details') {
        this.selectedLabelsInTable = countBy(flatten(selectedItems.map((x) => x.labels)), 'label');
      } else {
        this.selectedLabelsInTable = countBy(flatten(selectedItems.map((x) => x.labels)), 'name');
      }

      this.selectedLabels = [];
      for (var property in this.selectedLabelsInTable) {
        this.selectedLabels.push(property);
      }
      this.cleanLabels();
    }
  }

  get items() {
    return this._items;
  }

  _labelItems;
  set labelItems(its) {
    this._labelItems = its;
  }

  get labelItems() {
    return this._labelItems;
  }
  @Output() onClickItem = new EventEmitter();
  @Output() searchLabel = new EventEmitter();
  @Output() onChangeLabels = new EventEmitter();
  @Output() onClickApply = new EventEmitter();
  @Output() listLabels = new EventEmitter<any[]>();

  constructor(
    private el: ElementRef,
    private modulesService: ModulesService,
    private lcs: LabelService,
    private organizationService: OrganizationService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.currentModuleSubscription = this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
    });
  }

  ngOnDestroy() {
    this.currentModuleSubscription.unsubscribe();
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
    this.isIndeterminateV = this.selectedLabelsInTable[labelName] < this.selectedItemsLength;
    return this.selectedLabelsInTable[labelName] < this.selectedItemsLength;
  }

  isChecked(labelName) {
    this.isCheckedV = this.selectedLabelsInTable[labelName] && this.selectedLabelsInTable[labelName] > 0;
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
    let organizationId: number = 1;

    if (this.activeModule) {
      if (type == 'create' && this.newLabelName) {
        this.lcs
          .createLabel(
            this.newLabelName,
            this.newLabelTextColor,
            this.newLabelColor,
            this.activeModule.id,
            organizationId
          )
          .subscribe(
            (data) => {
              this.addNewLabelToActualItems(data);
            },
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
            organizationId
          )
          .subscribe(
            (data) => this.updateLabelOnActualItems(data),
            (error) => console.log(error)
          );
      }
    }
  }

  addNewLabelToActualItems(label) {
    let nl = {
      id: label.id,
      bgColor: this.newLabelColor,
      label: label.label,
      textColor: this.newLabelTextColor,
    };

    this.labelItems.push(nl);
    this.listLabels.emit(this.labelItems);
    // this.cleanLabelsNgZone();
    // this.addLabelToggle();
    this.onChangeCheckbox(nl, null);
    this.onClickApply.emit();
  }

  updateLabelOnActualItems(label) {
    let nl = {
      id: label.id,
      bgColor: this.itemToEdit.bgColor,
      label: this.itemToEdit.label,
      textColor: this.itemToEdit.textColor,
    };
    this.substituteLabels(nl);
    // this.cleanLabelsNgZone();
    this.cleanLabels();
    this.onChangeCheckbox(nl, null);
  }

  sortLabels() {
    this.labelItems.sort((a, b) => {
      if (a.label < b.label) return -1;
      else if (a.label > b.label) return 1;
      else return 0;
    });
  }

  sortCheckedLabels() {
    this.selectedLabels.sort((a, b) => {
      if (a < b) return -1;
      else if (a > b) return 1;
      else return 0;
    });
  }

  cleanLabels() {
    this.sortLabels();
    this.sortCheckedLabels();

    let tempArrayItems = [];
    let tempArrayIndex = [];
    this.labelItems.forEach((labelItem, index) => {
      let isTrue = false;

      this.selectedLabels.forEach((selectedLabel) => {
        if (!isTrue) {
          isTrue = labelItem.label === selectedLabel;
        }
      });
      if (isTrue) {
        tempArrayItems.push(labelItem);
        tempArrayIndex.push(index);
      }
    });

    for (let i = tempArrayIndex.length - 1; i >= 0; i--) {
      this.labelItems.splice(tempArrayIndex[i], 1);
    }
    this.labelItems = tempArrayItems.concat(this.labelItems);
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
