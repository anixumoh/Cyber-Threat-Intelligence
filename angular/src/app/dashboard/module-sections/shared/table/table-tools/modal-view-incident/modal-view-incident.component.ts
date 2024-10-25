import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { ResourcesService } from 'app/services/resources.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Component({
  selector: 'modal-view-incident',
  templateUrl: './modal-view-incident.component.html',
  styleUrls: ['./modal-view-incident.component.scss'],
})
export class ModalViewIncidentComponent implements OnInit, OnDestroy {
  @Input() onCloseIncident;
  @Input()
  set selectedItemIssues(items) {
    this._selectedItemIssues = items;
  }
  @Input() isModalOpen;
  @Output() onCloseModal = new EventEmitter();

  issuesTypes: any;
  issuesList: any;
  moduleName: any;
  activeModule: any;
  _selectedItemIssues: any;
  selectedResource: any;
  isLoading = false;
  private readonly destroy$ = new Subject<void>();

  get selectedItemIssues() {
    return this._selectedItemIssues;
  }

  constructor(
    private el: ElementRef,
    private organizationService: OrganizationService,
    private resourcesService: ResourcesService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        if (context.currentOrganization && context.currentModule && context.currentModule.id) {
          this.activeModule = context.currentModule;
          this.moduleName = this.activeModule.moduleName;
        }
      });
    this.resourcesService
      .getResourceIssueSubject()
      .asObservable()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((issue) => {
          if (JSON.stringify(issue) !== '{}') {
            this.isLoading = true;
            this.selectedItemIssues = [];
            this.selectedResource = issue;
            return this.resourcesService.listIssuesByResource(issue);
          }
          return Observable.of(null);
        })
      )
      .subscribe((listOfIssues) => {
        if (listOfIssues) {
          this.issuesList = listOfIssues;
          this._selectedItemIssues = listOfIssues;
          this.isLoading = false;
          if (!this.ref.detectChanges['destroyed']) {
            this.ref.detectChanges();
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
