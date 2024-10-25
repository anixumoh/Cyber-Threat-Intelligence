import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  finalize,
  takeUntil,
  catchError,
  take,
  map,
  distinctUntilChanged,
  tap,
  filter,
  debounceTime
} from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ResourcesService } from '../../../services/resources.service';
import { IncidentsService, StoreIncidentDTO } from '../../../core/models/incidents.service';
import { Grants } from '../../../services/grants/grants';

@Component({
  selector: 'app-modal-incident',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal-incident.component.html',
  styleUrls: ['./modal-incident.component.scss']
})
export class ModalIncidentComponent implements OnInit, OnDestroy {
  @Input() organizationId: number;
  @Input() moduleId: string;
  @Input() moduleName: string;
  @Input() resources: any[];
  @Input() bulk: boolean;
  @Input() open: boolean;
  @Input() mode: 'FORM' | 'LIST';
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  @Output() onNoIssuesLeft = new EventEmitter();
  loading = false;
  existingIssuesLoaded = false;
  viewMode = {
    form: 'FORM',
    list: 'LIST'
  };
  data: StoreIncidentDTO = {
    title: '',
    description: '',
    remediationTips: '',
    typeId: '',
    username: ''
  };
  existingIssueSelected;
  issueTypeSelected;
  fromExisting = false;
  types = [];
  filterIssuesTypes = [];
  issues = [];
  filteredIssuesList = [];
  assignedIssues = [];
  incidentDisabled = true;
  typeDisabled = false;
  showSelectCtrl = true;
  isLoadingUsers = false;
  usersList = [];
  selectedUser = undefined;
  searchValue = '';
  search$ = new BehaviorSubject('');
  private readonly destroy$ = new Subject<void>();

  constructor(
    private resourcesService: ResourcesService,
    private incidentsService: IncidentsService,
    private toastrService: ToastrService,
    private grants: Grants,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTypes();
    this.getIncidents();
    this.getList();
    this.initSubject();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchMode(event, mode) {
    event.preventDefault();
    event.stopPropagation();
    this.mode = mode;
  }

  navigateToIssue(selected) {
    const { organizationId, moduleId, id } = selected.$event.item;
    this.router.navigate([`/dashboard/organizations/${organizationId}/modules/${moduleId}/incidents/${id}`]).then();
  }

  closeModal() {
    this.onClose.emit();
  }

  initSubject() {
    this.search$
      .pipe(
        takeUntil(this.destroy$),
        filter((term: string) => term === '' || term?.length >= 3),
        debounceTime(1500)
      )
      .subscribe(() => this.getUsersIncident());
  }

  debounceSearch(event: any) {
    const { value } = event.target;
    this.searchValue = value;
    this.search$.next(value);
  }

  getSelectedUser(user) {
    this.selectedUser = { username: user };
  }

  filterIssuesType(event: any) {
    const { value } = event.target;
    this.filterIssuesTypes = this.types.filter(({ label }: any) => label.toUpperCase().includes(value.toUpperCase()));
  }

  getUsersIncident() {
    this.isLoadingUsers = true;
    this.resourcesService
      .getUsersIncident(this.moduleId, { q: this.searchValue })
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        const filterUsers = users
          .filter(({ username }: any) => username !== '')
          .map(({ username }: any) => ({
            value: username,
            label: username
          }));
        this.usersList = filterUsers.length ? filterUsers : [{ value: '', label: 'No results' }];
        this.isLoadingUsers = false;
      });
  }

  filterIssuesList(event: any) {
    const { value } = event.target;
    this.filteredIssuesList = this.issues
      .filter(({ title }: any) => title.toUpperCase().includes(value.toUpperCase()))
      .map(({ id, title }: any) => ({ label: title, value: id }));
  }

  saveModal() {
    if (this.grants.isCustomer()) {
      this.toastrService.error('Access Denied', 'Error');
      return;
    }

    if (this.fromExisting) {
      if (this.existingIssueSelected) {
        this.assignIssue(this.existingIssueSelected).subscribe(() => {
          this.toastrService.success('The resource has been added to the Incident', 'Success');
        });
      }
    } else if (this.data.title) {
      this.loading = true;
      this.storeIssue()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          ({ issueId }: any) => {
            if (issueId) {
              this.assignIssue(issueId).subscribe(() => {
                this.toastrService.success('Incident was successfully created', 'Success');
              });
            }
          },
          () => this.toastrService.error('There was an error while creating the incident. Please try again.', 'Error'),
          () => (this.loading = false)
        );
    }
  }

  storeIssue() {
    const data = { ...this.data, username: this.selectedUser?.username || '' };
    if (this.issueTypeSelected) {
      data.typeId = this.issueTypeSelected;
    }
    return this.incidentsService.store(data, this.organizationId, this.moduleId).pipe(take(1));
  }

  assignIssue(issueId) {
    const resources = this.resources.map((resource) => resource.id);
    this.loading = true;
    return this.incidentsService.assignToResource(resources, issueId, this.organizationId, this.moduleId).pipe(
      takeUntil(this.destroy$),
      take(1),
      tap(() => this.onSave.emit()),
      finalize(() => (this.loading = false))
    );
  }

  onNewIssueType(type) {
    this.issueTypeSelected = type;
  }

  onExistingIssue(issue) {
    this.existingIssueSelected = issue;
  }

  failOnType() {
    return this.data.title.trim().length === 0 && this.incidentDisabled;
  }
  failOnItem() {
    return this.typeDisabled && !this.existingIssueSelected;
  }

  enableType() {
    this.fromExisting = false;
    this.typeDisabled = false;
    this.incidentDisabled = true;
    this.reset();
  }

  enableIncident() {
    this.fromExisting = true;
    this.typeDisabled = true;
    this.incidentDisabled = false;
    this.reset();
  }

  get isDisabledAcceptBtn(): boolean {
    return this.loading || this.fromExisting ? this.failOnItem() : this.failOnType();
  }

  reloadSelectCtrl() {
    this.showSelectCtrl = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showSelectCtrl = true;
      this.cdr.detectChanges();
    }, 0);
  }

  getTypes() {
    this.resourcesService
      .getIssuesTypesIsolate(this.organizationId, this.moduleId, this.moduleName)
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        take(1),
        catchError(() => of([]))
      )
      .subscribe((types) => (this.types = types));
  }

  getIncidents() {
    this.resourcesService
      .getIssuesByModuleIsolate(this.organizationId, this.moduleId, this.moduleName)
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        map((res) => res.items),
        take(1),
        finalize(() => (this.existingIssuesLoaded = true)),
        catchError(() => of([]))
      )
      .subscribe((issues) => {
        this.issues = issues.filter(({ title }: any) => title !== '');
        this.filteredIssuesList = this.issues.map(({ id, title }: any) => ({ label: title, value: id }));
      });
  }

  removeIssueFromResource(issue) {
    this.loading = true;
    this.incidentsService
      .unAssignToResource(this.resources[0].id, issue.item.id, this.organizationId, this.moduleId, this.moduleName)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.assignedIssues.splice(issue.index, 1);
        if (this.assignedIssues.length === 0) {
          this.onNoIssuesLeft.emit();
        }
      });
  }

  getList() {
    this.loading = true;
    this.incidentsService
      .getByResourceId(this.resources[0].id, this.organizationId, this.moduleId, this.moduleName)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((res) => (this.assignedIssues = res));
  }

  private reset() {
    this.data = {
      title: '',
      description: '',
      remediationTips: '',
      typeId: ''
    };
    this.existingIssueSelected = null;
    this.issueTypeSelected = null;
    this.reloadSelectCtrl();
  }
}
