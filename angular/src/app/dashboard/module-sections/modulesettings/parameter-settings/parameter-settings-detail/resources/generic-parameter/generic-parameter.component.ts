import { Component, Input } from '@angular/core';
import { GenericParameter } from './generic-parameter';
import { Grants } from '../../../../../../../services/grants/grants';

@Component({
  selector: 'app-generic-parameter',
  templateUrl: './generic-parameter.component.html',
  styleUrls: ['./generic-parameter.component.scss'],
  providers: [GenericParameter]
})
export class GenericParameterComponent {
  @Input() set parameter(its) {
    if (its) {
      this.parameterObject.setParameter(its);
      this.parameterObject.setParameterData(its);
    }
  }

  parameterIndex;
  deleteConfirmation = false;
  deleteAllConfirmation = false;
  openForm = false;

  constructor(public parameterObject: GenericParameter, public grants: Grants) {}

  checkIfAnySelected() {
    this.parameterObject.checkIfAnySelected();
  }

  resetInputSelectAll() {
    this.parameterObject.resetSelectAll();
  }

  addData() {
    this.parameterObject.addData();
    this.openForm = false;
  }

  delete() {
    this.parameterObject.delete();
    this.deleteAllConfirmation = false;
  }

  deleteOne(index) {
    this.parameterObject.deleteOne(index);
    this.deleteConfirmation = false;
  }

  searchInList(event): void {
    this.parameterObject.searchInList(event);
  }

  updateElement(obj) {
    this.parameterObject.updateElement(obj);
  }

  updateSelectAll(value) {
    this.parameterObject.updateSelectAll(value);
  }

  renderValue(item) {
    return item && item.value ? item.value : '-';
  }

  openConfirmationModal(index) {
    this.deleteConfirmation = true;
    this.parameterIndex = index;
  }

  closeConfirmation() {
    this.deleteConfirmation = false;
    this.deleteAllConfirmation = false;
    this.parameterIndex = null;
    this.searchInList('');
    this.checkIfAnySelected();
  }

  openDeleteAllConfirmationModal() {
    this.deleteAllConfirmation = true;
  }

  openCloseSearch(e) {
    if (!e) {
      this.searchInList('');
      if (this.parameterObject.anyChecked) {
        this.parameterObject.anyChecked = false;
      }
    }
  }

  protected sendData() {
    this.parameterObject.sendData();
  }

  showAdd() {
    this.openForm = !this.openForm;
  }

  openAdd() {
    this.addData();
    this.resetInputSelectAll();
  }

  get disableAdd() {
    return this.grants?.isCustomerOrOperator() || !this.parameterObject?.newData;
  }

  closeForm() {
    this.showAdd();
    this.parameterObject.newData = undefined;
  }
}
