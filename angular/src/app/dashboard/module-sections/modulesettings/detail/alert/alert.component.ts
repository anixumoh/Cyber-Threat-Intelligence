import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';
@Component({
  selector: 'alert_list',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class AlertComponent extends SettingDetailAbstract implements OnDestroy {
  @ViewChild('dropdownButton', { read: ElementRef }) dropdownButton: ElementRef;
  @ViewChild('dropdownList', { read: ElementRef }) dropdownList: ElementRef;

  isMenuOpened: boolean = false;

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onClickOutside(event) {
    if (this.isMenuOpened && this.dropDownButtonToCloseValidation(event) && this.dropDownListToCloseValidation(event)) {
      this.toggleMenu();
    }
  }

  dropDownButtonToCloseValidation(event) {
    return this.dropdownButton && !this.dropdownButton.nativeElement.contains(event.target);
  }

  dropDownListToCloseValidation(event) {
    return (
      this.dropdownList &&
      !this.dropdownList.nativeElement.contains(event.path.length < 3 ? event.target : event.path[2]) &&
      !this.dropdownList.nativeElement.contains(event.path.length < 2 ? event.target : event.path[1])
    );
  }

  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
  }

  selectUser(item) {
    this.data.values_to_add = [this.data.adder(item.id)];
    this.updateUsersList(item, true);
    this.sendData();
    item.value = item.name;
    this.values.unshift(item);
  }

  updateUsersList(userToModify, isAdd: boolean) {
    this.usersList = this.usersList.map((user) => {
      if (userToModify.id == user.id) {
        user.notShow = isAdd;
      }
      return user;
    });
  }

  delete() {
    this.updateUsersListDelete();
    super.delete();
  }

  updateUsersListDelete() {
    this.values
      .filter((value) => {
        if (value.selected === true) {
          return true;
        }
        return false;
      })
      .forEach((element) => {
        this.updateUsersList(element, false);
      });
  }

  loadUsers() {
    if (!this.grants.isCustomer()) {
      this.usersService
        .getUsersList()
        .pipe(takeUntil(this.destroy$))
        .subscribe((users) => {
          this.usersList = users.list;
          this.values.forEach((element) => {
            this.updateUsersList(element, true);
          });
        });
    }
  }

  identify(index, item) {
    return item ? item.id : undefined;
  }
}
