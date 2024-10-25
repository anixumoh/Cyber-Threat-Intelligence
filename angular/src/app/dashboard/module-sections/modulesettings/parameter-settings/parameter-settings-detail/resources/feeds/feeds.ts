import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { FeedsService } from './feeds.service';
import { Alert } from '../alerts/alert';

export class Feeds {
  allRequests;
  feeds;
  statefeeds;
  modules;
  listAlertFeeds;
  listBanksFeeds;
  listCreditCardsFeeds;
  constructor(protected feedsService: FeedsService, public parameterObject: Alert) {}

  public setBooleans() {
    const myRequests = [
      this.feedsService.getFeedBooleans(),
      this.feedsService.getAlertFeeds(),
      this.feedsService.getBankFeeds(),
      this.feedsService.getCreditCardFeeds(),
    ];
    this.allRequests = observableForkJoin(myRequests).subscribe(
      ([resultData1, resultData2, resultData3, resultData4]) => {
        this.feeds = resultData1;
        this.listAlertFeeds = resultData2;
        this.parameterObject.parameterData = this.listAlertFeeds['values'];
        this.listBanksFeeds = resultData3;
        this.listCreditCardsFeeds = resultData4;
      }
    );
  }

  public changeStatePublicFeed() {
    this.feeds.publicFeed = !this.feeds.publicFeed;
    this.statefeeds = this.feeds.publicFeed;
    this.modules = 'publicfeed';
    this.sendFeedData();
  }

  public changeStateNewCard() {
    this.feeds.activateAlerts = !this.feeds.activateAlerts;
    this.feeds.alertBanks = true;
    this.feeds.alertCorporates = true;
    this.statefeeds = this.feeds.activateAlerts;
    this.modules = 'activatealerts';
    this.sendFeedData();
  }

  public changeStateBankCard() {
    this.feeds.alertBanks = !this.feeds.alertBanks;
    this.statefeeds = this.feeds.alertBanks;
    this.modules = 'alertbank';
    this.sendFeedData();
  }

  public changeStateCorpCard() {
    this.feeds.alertCorporates = !this.feeds.alertCorporates;
    this.statefeeds = this.feeds.alertCorporates;
    this.modules = 'alertcorporate';
    this.sendFeedData();
  }

  private sendFeedData() {
    this.feedsService.saveFeedSettingsDataCarding(this.modules, this.statefeeds);
  }
}
