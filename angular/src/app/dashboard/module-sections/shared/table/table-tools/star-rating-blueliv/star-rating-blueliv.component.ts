import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StarRatingComponent, StarRatingConfigService } from 'angular-star-rating';
import { starRatingStarTypes } from 'angular-star-rating/src/interfaces/star-rating-config.interface';
import { StarRatingBluelivService } from 'app/dashboard/module-sections/shared/table/table-tools/star-rating-blueliv/star-rating-blueliv.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Subscription } from 'rxjs';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'star-rating-blueliv',
  templateUrl: './star-rating-blueliv.component.html',
  styleUrls: ['./star-rating-blueliv.component.scss']
})
export class StarRatingBluelivComponent extends StarRatingComponent implements OnInit, OnDestroy {
  _readOnlyCustom: boolean;
  @Input() isResource = false;
  @Input() rating: number;
  @Input() orgId;
  @Input() moduleId;
  @Input() moduleType;
  @Input() settingFilter: boolean;
  @Input() resource: any;
  @Input()
  set readOnlyCustom(its) {
    this._readOnlyCustom = its;
    this.readOnly = this._readOnlyCustom;
  }
  get readOnlyCustom() {
    return this._readOnlyCustom;
  }
  @Input() editMode;
  @Input() newMode;
  @Input() id;
  @Input() disabled = false;

  @Output() ratingFilter = new EventEmitter();
  @Output() ratingEmit = new EventEmitter();

  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;

  public subscriptionList: Subscription[] = [];
  public starType: starRatingStarTypes = 'svg';
  private oldValue: number;

  constructor(
    private starRatingBluelivService: StarRatingBluelivService,
    private organizationService: OrganizationService,
    private moduleSettingsDetailService: ModuleSettingsDetailService,
    public grants: Grants,
    public config: StarRatingConfigService
  ) {
    super(config);
  }

  ngOnInit() {
    this.readOnly = this.readOnlyCustom;
    this.oldValue = this.rating;
    let subscription = this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
    this.subscriptionList.push(subscription);
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((subscription) => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
  }

  clickedStar(id: number, starValue: number, event: MouseEvent) {
    event.stopPropagation();
    if (!this.disabled) {
      if (this.oldValue === starValue) {
        // reset or no
        this.oldValue = 0;
      } else {
        this.oldValue = starValue;
      }
      super.onStarClicked(this.oldValue);
      if (!this.editMode) {
        if (id.toString().length > 5 || this.isResource) {
          this.ratingEmit.emit({ loading: true });
          let subscription = this.starRatingBluelivService
            .updateStar(id, this.oldValue, this.orgId, this.moduleId, this.moduleType)
            .subscribe(() => {
              this.ratingEmit.emit({ loading: false, value: this.oldValue });
            });
          this.subscriptionList.push(subscription);
        } else {
          this.updateFilterRating(this.oldValue, id);
          return;
        }
      } else {
        this.ratingFilter.emit(this.oldValue);
      }
    }
  }

  updateFilterRating(starValue, id) {
    this.resource.id = id;
    this.resource[0].actions[6].value = starValue;
    let data = this.getClonedData(this.resource[0]);
    data.conditions.splice(3, 1);
    this.ratingEmit.emit();
    if (!this.newMode) {
      this.moduleSettingsDetailService.saveFiltersData(data);
    }
  }

  getClonedData(data) {
    let dataClone = JSON.parse(JSON.stringify(data));
    if (dataClone.conditions[3].value[0] === 0 || dataClone.conditions[3].value[0] === '') {
      dataClone.conditions.splice(3, 1);
    }
    if (dataClone.conditions[1].value.length > 1) {
      dataClone.conditions[1].value.splice(1, dataClone.conditions[1].value.length);
    }

    if (dataClone.actions[4] && dataClone.actions[4].type === 'LAUNCH_ALERT') {
      if (dataClone.actions[4].value === false) {
        dataClone.actions.splice(4, 1);
      } else {
        delete dataClone.actions[4].value;
      }
    }
    if (dataClone.actions[2] && dataClone.actions[2].type === 'DELETE') {
      if (dataClone.actions[2].value === false) {
        dataClone.actions.splice(2, 1);
      } else {
        delete dataClone.actions[2].value;
      }
    }
    if (dataClone.actions[1] && dataClone.actions[1].type === 'CUT_EXECUTION') {
      if (dataClone.actions[1].value === false) {
        dataClone.actions.splice(1, 1);
      } else {
        delete dataClone.actions[1].value;
      }
    }

    return dataClone;
  }
}
