import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FiltersGenericService } from 'app/services/filtersGeneric.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Subscription } from 'rxjs';
import { Store } from 'app/services/store/store';
import { UserAccountService } from 'app/dashboard/user/account.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-list-order',
  templateUrl: 'list-order.component.html',
  styleUrls: ['./list-order.component.scss'],
})
export class listOrderComponent implements OnInit, OnDestroy {
  currentModule: any;
  currentOrganization: any;
  activeContext: any;
  order: any;
  noOrder: boolean = true;
  orderGoDown: boolean = false;
  orderGoUp: boolean = false;
  state: any;
  state$: any;
  moduleId: any;
  organizationId: any;
  finalDirection: any;
  activeContext$: any;

  subscriptionList: Subscription[] = [];

  @Input() value: string;

  constructor(
    private filtersGenericService: FiltersGenericService,
    private organizationService: OrganizationService,
    private store: Store,
    private userAccountService: UserAccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.activeContext$ = this.organizationService.getCurrentContext().subscribe(context => {
      this.initializeContext(context);
    });

    this.subscriptionList.push(this.activeContext$);
  }

  ngOnDestroy() {
    this.destroySubscriptions();
  }

  destroySubscriptions() {
    this.subscriptionList.forEach(s => {
      if (s.unsubscribe) {
        s.unsubscribe();
      }
    });
  }

  initializeContext(context) {
    if (context && context.currentState.value && context.currentOrganization && context.currentModule) {
      if (this.changedContext(context)) {
        this.initializeIds(context);
        this.initializeState(context);
      }
    }
  }

  changedContext(context) {
    return this.organizationId != context.currentOrganization.id || this.moduleId != context.currentModule.id;
  }

  initializeIds(context) {
    this.currentOrganization = context.currentOrganization;
    this.currentModule = context.currentModule;
    this.organizationId = context.currentOrganization.id;
    this.moduleId = context.currentModule.id;
    this.activeContext = JSON.parse(
      JSON.stringify({ currentOrganization: this.currentOrganization, currentModule: this.currentModule })
    );
  }

  initializeState(context) {
    if (!this.state$) {
      this.state$ = this.store.select('userStateList').subscribe(state => {
        if (state) {
          this.state = state;
          this.isOrderByStateActive(this.state, this.organizationId, this.moduleId);
          // this.applyInitialState();
        }
      });
      this.subscriptionList.push(this.state$);
    }
  }

  orderDictionary(value) {
    switch (value) {
      case 'Affected assets':
        return 'T';
      case 'Title':
        return 'T';
      case 'TYP':
        return 'AR';
      case 'Country':
        return 'C';
      case 'Url':
        return 'U';
      case 'Rating':
        return 'RT';
      case 'Date/Time':
        return 'D';
    }
  }

  isOrderByStateActive(state, organizationId, moduleId) {
    this.noOrder = true;
    this.orderGoUp = false;
    this.orderGoDown = false;
    if (_.has(state.modules, [organizationId, moduleId, 'filters', 'byOrder'])) {
      let { order, direction } = state.modules[organizationId][moduleId].filters.byOrder;
      this.doConversionForExceptions();
      if (order && direction && order == this.orderDictionary(this.value)) {
        if (direction === 'ASC') {
          this.noOrder = false;
          this.orderGoUp = true;
        } else if (direction === 'DESC') {
          this.noOrder = false;
          this.orderGoDown = true;
        }
      }
    }
  }

  actionForOrder() {
    if (this.noOrder) {
      this.letsOrderDown();
    } else if (this.orderGoDown) {
      this.letsOrderUp();
    } else if (this.orderGoUp) {
      this.letsInitialOrder();
    }
  }

  letsOrderUp() {
    this.noOrder = false;
    this.orderGoDown = false;
    this.orderGoUp = true;
    this.orderUp('ASC');
  }

  letsOrderDown() {
    this.noOrder = false;
    this.orderGoDown = true;
    this.orderGoUp = false;
    this.orderDown('DESC');
  }

  letsInitialOrder() {
    this.noOrder = true;
    this.orderGoDown = false;
    this.orderGoUp = false;
    this.noOrderSelected(undefined);
  }

  orderUp(direction) {
    this.doConversionForExceptions();
    this.sendTheDirection(direction);
  }

  orderDown(direction) {
    this.doConversionForExceptions();
    this.sendTheDirection(direction);
  }

  noOrderSelected(direction) {
    this.order = undefined;
    this.store.update('userStateList', 'deleteState', this.activeContext);
    if (!this.cdr.detectChanges['destroyed']) {
      this.cdr.detectChanges();
    }
    direction = {};
    this.applyFilter(direction);
  }

  doConversionForExceptions() {
    if (this.value.substring(0, 8) === 'Affected') {
      this.value = 'Affected assets';
    }
    if (this.value.substring(0, 5) === 'Title') {
      this.value = 'Title';
    }
  }

  sendTheDirection(direction) {
    this.finalDirection = {
      order: this.orderDictionary(this.value),
      direction,
    };
    this.applyFilter(this.finalDirection);
  }

  applyFilter(finalDirection) {
    this.userAccountService.setStateOrderListFilter(
      this.organizationService.currentContext.currentOrganization.id,
      this.organizationService.currentContext.currentModule.id,
      finalDirection
    );
  }
}
