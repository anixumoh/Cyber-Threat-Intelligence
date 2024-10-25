import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { UsersService } from 'app/services/users.service';
import { ModuleSettingsDetailService } from '../../modulesettings/detail/module-settings-detail.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { FeedsService } from 'app/dashboard/module-sections/modulesettings/parameter-settings/parameter-settings-detail/resources/feeds/feeds.service';
import { Grants } from '../../../../services/grants/grants';
import { ToastrService } from 'ngx-toastr';
import { emailRegexp } from 'app/utils/validators';

@Component({
  selector: 'app-alerts-aside',
  templateUrl: './alerts-aside.component.html',
  styleUrls: ['./alerts-aside.component.scss'],
  providers: [Grants, FeedsService]
})
export class AlertsAsideComponent implements OnInit, OnDestroy {
  showAddUser = false;
  showAddEmail = false;
  usersList;
  isMenuOpened;
  values;
  addedUsersList;
  loading = true;
  moduleType;
  feeds;
  listAlertFeeds;
  data;
  listBanksFeeds;
  listCreditCardsFeeds;
  statefeeds;
  modules;
  showMode;
  emailError = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected usersService: UsersService,
    protected moduleSettingsDetailService: ModuleSettingsDetailService,
    protected organizationService: OrganizationService,
    protected feedsService: FeedsService,
    public grants: Grants,
    protected toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getUsersList();

    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.moduleType = res.currentModule.moduleName;

        if (this.moduleType !== 'credit_card') {
          this.getAddedUsers();
        } else {
          const myRequests = [
            this.feedsService.getFeedBooleans(),
            this.feedsService.getAlertFeeds(),
            this.feedsService.getBankFeeds(),
            this.feedsService.getCreditCardFeeds()
          ];

          forkJoin(myRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe(([resultData1, resultData2, resultData3, resultData4]) => {
              this.feeds = resultData1;
              this.addedUsersList = resultData2['values'];
              this.listAlertFeeds = resultData2;
              this.data = this.listAlertFeeds['values'];
              this.values = this.listAlertFeeds['values'];

              this.listBanksFeeds = resultData3;
              this.listCreditCardsFeeds = resultData4;
            });
        }
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleMenu() {
    this.values = this.usersList;
    this.isMenuOpened = !this.isMenuOpened;
  }

  closeAddInput(type) {
    switch (type) {
      case 'email':
        this.showAddEmail = false;
        this.emailError = '';
        break;
      case 'user':
        this.showAddUser = false;
        this.isMenuOpened = false;
        this.emailError = '';
        break;
    }
  }

  getUsersList() {
    this.usersService
      .getUsersList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.usersList = users.list;

        this.getAddedUsers();
      });
  }

  searchUser(event): void {
    this.isMenuOpened = true;
    const word = event.target.value.toLowerCase();
    if (word.length > 0) {
      this.values = this.usersList;
      const temp = [];
      this.values.forEach((value) => {
        if (value.username.toLowerCase().indexOf(word) >= 0) {
          temp.push(value);
        }
      });
      this.values = temp;
    } else {
      this.values = this.usersList.name;
      this.isMenuOpened = false;
    }
  }

  selectUser(item) {
    const id = item.id;
    item.value = item.username;
    let duplicated = undefined;
    const existEmail = !!item?.email;
    if (item?.email) {
      duplicated = this.addedUsersList.findIndex((user) => user.email === item.email);
    }
    if (existEmail && duplicated > -1) {
      this.toastrService.error('There is already an alert for that user', 'Error');
      this.showAddUser = false;
    } else {
      this.loading = true;
      this.addedUsersList.unshift(item);
      this.sendUser(id);
      this.showAddUser = false;
    }
  }

  regexForEmail(email) {
    return email.toLowerCase().match(emailRegexp);
  }

  selectEmail(email) {
    if (!email) {
      return (this.emailError = 'Please provide an e-mail');
    } else if (!this.regexForEmail(email)) {
      return (this.emailError = 'Invalid e-mail');
    }

    const duplicated = this.addedUsersList.findIndex((user) => user.email === email);

    if (duplicated > -1) {
      this.toastrService.error('There is already an alert for that e-mail', 'Error');
      return;
    } else {
      const userIndex = this.usersList.findIndex((user) => user.email === email);
      this.loading = true;
      if (userIndex > -1) {
        this.sendUser(this.usersList[userIndex].id);
        this.emailError = '';
        this.showAddEmail = false;
      } else {
        this.sendUser(email);
        this.emailError = '';
        this.showAddEmail = false;
      }
    }
  }

  sendUser(id) {
    const data = {
      values_to_add: [{ value: id }]
    };
    this.moduleSettingsDetailService
      .saveSettingsDataParameter('alert', data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        () => {
          this.isMenuOpened = false;
          this.getUsersList();
        },
        ({ error }) => {
          if (error?.message.includes('error.email_already_exist')) {
            this.toastrService.error('There is already an alert for that e-mail', 'Error');
          }
          if (error?.message.includes('error.invalid_alert_parameters')) {
            this.toastrService.error('Invalid alert parameters', 'Error');
          }
        }
      );
  }

  deleteUser(user) {
    const data = {
      values_to_delete: [{ value: user.id || user.value }]
    };

    this.moduleSettingsDetailService
      .deleteSettingDataParameter('alert', data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getUsersList();
      });
  }

  getAddedUsers() {
    this.moduleSettingsDetailService
      .getParameterData('alert')
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const { values } = res;
        this.addedUsersList = [...values];
        this.addEmails();
      });
  }

  addEmails() {
    if (this.addedUsersList && this.usersList && this.addedUsersList.length > 0 && this.usersList.length > 0) {
      this.addedUsersList.forEach((addedUser, index) => {
        this.usersList.map((user) => {
          if (addedUser.id === user.id.toString() || addedUser.id === user.id) {
            this.addedUsersList[index] = { ...addedUser, username: addedUser.value, email: user.email };
          } else {
            return addedUser;
          }
        });
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  updateUsersList(userToModify, isAdd: boolean) {
    this.usersList = this.usersList.map((user) => {
      if (userToModify.id === user.id) {
        user.notShow = isAdd;
      }
      return user;
    });
  }

  // FEEDS

  changeStatePublicFeed() {
    this.feeds.publicFeed = !this.feeds.publicFeed;
    this.statefeeds = this.feeds.publicFeed;
    this.modules = 'publicfeed';
    this.sendFeedData();
  }

  changeStateNewCard() {
    this.feeds.activateAlerts = !this.feeds.activateAlerts;
    this.feeds.alertBanks = true;
    this.feeds.alertCorporates = true;
    this.statefeeds = this.feeds.activateAlerts;
    this.modules = 'activatealerts';
    this.sendFeedData();
  }

  sendFeedData() {
    this.feedsService.saveFeedSettingsDataCarding(this.modules, this.statefeeds);
  }

  changeStateBankCard() {
    this.feeds.alertBanks = !this.feeds.alertBanks;
    this.statefeeds = this.feeds.alertBanks;
    this.modules = 'alertbank';
    this.sendFeedData();
  }

  changeStateCorpCard() {
    this.feeds.alertCorporates = !this.feeds.alertCorporates;
    this.statefeeds = this.feeds.alertCorporates;
    this.modules = 'alertcorporate';
    this.sendFeedData();
  }

  selectUserFeed(item) {
    if (!this.grants.isCustomerOrOperator()) {
      let new_user_in_list = true;
      for (const user of this.listAlertFeeds.values) {
        if (user.id === item.id) {
          new_user_in_list = false;
        }
      }
      if (new_user_in_list) {
        this.data.values_to_add = [this.data.adder(item.id)];
        item.value = item.username;
        this.listAlertFeeds.values.unshift(item);
        this.values = this.listAlertFeeds.values;
      }
    }
  }
}
