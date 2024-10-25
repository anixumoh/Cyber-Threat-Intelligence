import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Alert} from "./alert";
import {Grants} from "../../../../../../../services/grants/grants";

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
  providers: [Alert],
  host: {'(document:click)': 'onClickOutside($event)'}
})
export class AlertsComponent {
  isMenuAlertOpened;
  @Input() set parameter(its) {
    this.parameterObject.setParameter(its);
    if (!this.grants.isCustomer()) {
      this.parameterObject.setParameterData(its, this.parameterObject.loadUsers.bind(this.parameterObject));
    } else {
      this.parameterObject.setParameterData(its);
    }
  };

  @ViewChild('dropDownUser') dropDownUser: ElementRef;
  @ViewChild('dropDownButtonUser') dropDownButtonUser: ElementRef;

  public onClickOutside(event) {
    if (
      this.checkDropDown(event.target) &&
      this.checkDropDownButton(event.target)
    ) {
      this.isMenuAlertOpened = false;
    }
  }

  private checkDropDown(target) {
    return (
      this.dropDownUser &&
      this.dropDownUser.nativeElement &&
      !this.dropDownUser.nativeElement.contains(target)
    );
  }

  private checkDropDownButton(target) {
    return (
      this.dropDownButtonUser &&
      this.dropDownButtonUser.nativeElement &&
      !this.dropDownButtonUser.nativeElement.contains(target)
    );
  }

  constructor(
    public parameterObject: Alert,
    public grants: Grants
  ) {
  }

  public checkIfAnySelected() {
    this.parameterObject.checkIfAnySelected();
  }

  public delete() {
    this.parameterObject.delete();
  }

  public deleteOne(index) {
    this.parameterObject.deleteOne(index);
  }


  public searchInList(event): void {
    this.parameterObject.searchInList(event);
  }

  public renderValue(item) {
    return item && item.value ? item.value : '-';
  }

  public toggleMenu() {
    this.isMenuAlertOpened = !this.isMenuAlertOpened;
  }

  public selectUser(item) {
    // if(!this.grants.isCustomerOrOperator()){
    this.parameterObject.selectUser(item)
    // }
  }

  public updateElement(obj) {
    this.parameterObject.updateElement(obj);
  }

  public updateSelectAll(value) {
    this.parameterObject.updateSelectAll(value);
  }
}
