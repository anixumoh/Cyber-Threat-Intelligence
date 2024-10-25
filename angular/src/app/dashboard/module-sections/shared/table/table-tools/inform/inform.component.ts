import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef
} from '@angular/core';
import { InformService } from 'app/dashboard/module-sections/shared/table/table-tools/inform/inform.service';
import { Router } from '@angular/router';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-inform',
  templateUrl: './inform.component.html',
  styleUrls: ['./inform.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class InformComponent implements OnInit, OnDestroy {
  statusSelected = '';
  informVisible: boolean = false;
  icons: boolean = false;
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  subscriptionList = [];
  _position = '';
  _status;
  isTrial = false;

  @Input()
  set status(its) {
    if (its) {
      this._status = its;
      this.statusSelected = its;
    }
  }

  get status() {
    return this._status;
  }

  @Input() resource;
  @Input() mName;
  @Input() showIcons: boolean = true;
  @Input() isButton: boolean = false;
  @Input() orgId;
  @Input() moduleId;
  @Input() moduleType;
  @Input() isLast = false;
  @Input()
  set position(p) {
    if (p == 'left') {
      this._position = 'informLeft';
    } else {
      this._position = p;
    }
  }
  get position() {
    return this._position;
  }

  @Input() multipleTreatment: boolean = false;
  @Output() informEmit = new EventEmitter();
  @Output() fromSelectedResourcesStatusToTable = new EventEmitter();

  constructor(
    private informService: InformService,
    private router: Router,
    private el: ElementRef,
    private organizationService: OrganizationService,
    public grants: Grants
  ) {
    // document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {
    let s = this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
      this.isTrial = context.currentOrganization.trial;
    });
    this.subscriptionList.push(s);
    // should we show text or icons
    if (this.showIcons === true) {
      this.icons = true;
    }
    if (this.status) {
      this.statusSelected = this.status;
    }
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((s) => {
      if (s.unsubscribe) {
        s.unsubscribe();
      }
    });
  }

  showInform() {
    if (!this.grants.isCustomer()) {
      this.informVisible = !this.informVisible;
    }
  }

  informClass(inform, isButton = false) {
    let buttonClass = '';
    if (!isButton) {
      buttonClass = '';
    }
    switch (inform) {
      case 'NOT_IMPORTANT':
        return buttonClass + 'text-dark';
      case 'POSITIVE':
        return buttonClass + 'text-success';
      case 'INFORMATIVE':
        return buttonClass + 'text-primary';
      case 'NEGATIVE':
        return buttonClass + 'text-danger';
    }
  }

  updateStatus(event, status: string) {
    if (this.multipleTreatment) {
      this.updateMultipleStatus(event, status);
    } else {
      this.updateSingle(event, status);
    }
  }

  updateMultipleStatus(event, status: string) {
    if (this.activeModule && this.activeOrganization && !this.grants.isCustomer()) {
      this.informVisible = false;
      let requestsArray: Array<any> = this.resource.map((element) => {
        return this.informService.sendStatus(status.toLowerCase(), element, this.orgId, this.moduleId, this.moduleType);
      });

      observableForkJoin(requestsArray).subscribe((data: any) => {
        this.resource = this.resource.filter((resource, index) => {
          return !data[index].error;
        });
        this.fromSelectedResourcesStatusToTable.emit({
          status,
          resources: this.resource
        });
      });
    }
  }

  updateSingle(event, status) {
    event.stopPropagation();
    if (!this.grants.isCustomer()) {
      this.informVisible = false;
      this.status = status;
      if (this.activeModule && this.activeOrganization) {
        this.informEmit.emit({ loading: true });
        this.informService
          .sendStatus(status.toLowerCase(), this.resource.id, this.orgId, this.moduleId, this.moduleType)
          .subscribe(() => {
            this.informEmit.emit({ loading: false, status });
          });
      }
    }
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.informVisible = false;
    }
  }
}
