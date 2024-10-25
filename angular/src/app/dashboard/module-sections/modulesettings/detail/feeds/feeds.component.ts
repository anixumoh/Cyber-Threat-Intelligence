import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
  host: { '(document:click)': 'onClickOutside($event)' },
})
export class FeedsComponent extends SettingDetailAbstract implements OnInit, OnDestroy {
  @ViewChild('dropDownUser') dropDownUser: ElementRef;
  @ViewChild('dropDownButtonUser') dropDownButtonUser: ElementRef;

  isMenuAlertOpened: boolean = false;
  feeds: any;
  v;
  listAlertFeeds;
  listBanksFeeds;
  listCreditCardsFeeds;
  allRequests: any;

  ngOnInit() {
    super.ngOnInit();
    let myRequests;
    if (this.data) {
      this.v = this.data;
    }

    myRequests = [
      this.feedsService.getFeedBooleans(),
      this.feedsService.getAlertFeeds(),
      this.feedsService.getBankFeeds(),
      this.feedsService.getCreditCardFeeds(),
    ];
    this.allRequests = forkJoin(myRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe(([resultData1, resultData2, resultData3, resultData4]) => {
        this.feeds = resultData1;

        this.listAlertFeeds = resultData2;
        this.data.values = this.listAlertFeeds['values'];
        this.values = this.listAlertFeeds['values'];

        this.listBanksFeeds = resultData3;

        this.listCreditCardsFeeds = resultData4;
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onClickOutside(event) {
    if (this.checkDropDown(event.target) && this.checkDropDownButton(event.target)) {
      this.isMenuAlertOpened = false;
    }
  }

  checkDropDown(target) {
    return this.dropDownUser && this.dropDownUser.nativeElement && !this.dropDownUser.nativeElement.contains(target);
  }

  checkDropDownButton(target) {
    return (
      this.dropDownButtonUser &&
      this.dropDownButtonUser.nativeElement &&
      !this.dropDownButtonUser.nativeElement.contains(target)
    );
  }

  toggleMenu() {
    this.isMenuAlertOpened = !this.isMenuAlertOpened;
  }

  changeStatePublicFeed(event) {
    this.feeds.publicFeed = !this.feeds.publicFeed;
    this.statefeeds = this.feeds.publicFeed;
    this.modules = 'publicfeed';
    this.sendFeedData();
  }

  changeStateNewCard(event) {
    this.feeds.activateAlerts = !this.feeds.activateAlerts;
    this.feeds.alertBanks = true;
    this.feeds.alertCorporates = true;
    this.statefeeds = this.feeds.activateAlerts;
    this.modules = 'activatealerts';
    this.sendFeedData();
  }

  changeStateBankCard(event) {
    this.feeds.alertBanks = !this.feeds.alertBanks;
    this.statefeeds = this.feeds.alertBanks;
    this.modules = 'alertbank';
    this.sendFeedData();
  }

  changeStateCorpCard(event) {
    this.feeds.alertCorporates = !this.feeds.alertCorporates;
    this.statefeeds = this.feeds.alertCorporates;
    this.modules = 'alertcorporate';
    this.sendFeedData();
  }

  selectUser(item) {
    if (!this.grants.isCustomerOrOperator()) {
      let new_user_in_list = true;
      for (let user of this.listAlertFeeds.values) {
        if (user.id === item.id) {
          new_user_in_list = false;
        }
      }
      if (new_user_in_list) {
        this.data.values_to_add = [this.data.adder(item.id)];
        this.updateUsersList(item);
        item.value = item.name;
        this.listAlertFeeds.values.unshift(item);
        this.values = this.listAlertFeeds.values;
      }
    }
  }

  updateUsersList(item) {
    let newUsersList = [];
    this.usersList.map((user) => {
      if (item.id != user.id) {
        newUsersList.push(user);
      }
    });
    this.usersList = newUsersList;
    this.sendData();
  }
}
