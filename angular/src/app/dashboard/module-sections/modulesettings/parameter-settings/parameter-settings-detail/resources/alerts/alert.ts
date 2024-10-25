import {Injectable} from "@angular/core";
import {Parameter} from "../parameter";
import {ModuleSettingsDetailService} from "../../../../detail/module-settings-detail.service";
import {UsersService} from "../../../../../../../services/users.service";

@Injectable()
export class Alert extends Parameter {
  usersList;
  constructor(
    protected moduleSettingsDetailService: ModuleSettingsDetailService,
    protected usersService: UsersService,
  ) {
    super(moduleSettingsDetailService)
  }

  public deleteData() {
    this.data.values_to_delete = [];
    this.selectedItems.forEach((el) => {
      this.data.values_to_delete.push({value: el.id});
    });
    this.selectedItems = [];
    this.moduleSettingsDetailService.deleteSettingDataParameter(
      this.parameter.id,
      this.data
    ).subscribe();
  }

  public loadUsers() {
    this.usersService.getUsersList()
      .subscribe((users) => {
        this.usersList = users.list;
        this.parameterData.forEach(element => {
          this.updateUsersList(element, true)
        });
      });
  }

  public selectUser(item) {
    this.data.values_to_add = [this.parameter.adder(item.id)];
    this.updateUsersList(item, true);
    item.value = item.name;
    this.parameterData.unshift(item);
    this.sendData();
  }

  private updateUsersList(userToModify, isAdd: boolean) {
    this.usersList = this.usersList.map((user) => {
      if (userToModify.id == user.id) {
        user.notShow = isAdd;
      }
      return user;
    });
  }

  delete(){
    this.updateUsersListDelete();
    super.delete();
  }

  private updateUsersListDelete(){
    this.parameterData
      .filter((value) => {
        if (value.selected === true) {
          return true;
        }
        return false;
      })
      .forEach(element => {
        this.updateUsersList(element,false)
      });
  }
}
