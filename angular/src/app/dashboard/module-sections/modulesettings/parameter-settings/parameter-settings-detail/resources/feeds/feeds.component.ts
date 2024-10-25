import {Component, Input} from '@angular/core';
import {FeedsService} from "./feeds.service";
import {AlertsComponent} from "../alerts/alerts.component";
import {Alert} from "../alerts/alert";
import {Feeds} from "./feeds";
import {Grants} from "../../../../../../../services/grants/grants";

export function feedsFactory(feedsService: FeedsService, parameterObject: Alert) {
  return new Feeds(feedsService, parameterObject);
}

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
  providers: [
    Alert,
    Grants,
    FeedsService,
    {
      provide: Feeds,
      useFactory: feedsFactory,
      deps: [FeedsService, Alert]
    }
  ],
})
export class FeedsComponent extends AlertsComponent{
  @Input() set parameter(its) {
    this.parameterObject.setParameter(its);
    this.parameterObject.loadUsers();
    this.feedsObject.setBooleans();
  };

  constructor(
    public parameterObject: Alert,
    public grants: Grants,
    public feedsObject: Feeds
  ) {
    super(parameterObject, grants)
  }

  public changeStatePublicFeed() {
    this.feedsObject.changeStatePublicFeed();
  }

  public changeStateNewCard() {
    this.feedsObject.changeStateNewCard();
  }

  public changeStateBankCard() {
    this.feedsObject.changeStateBankCard();
  }

  public changeStateCorpCard() {
    this.feedsObject.changeStateCorpCard();
  }
}
