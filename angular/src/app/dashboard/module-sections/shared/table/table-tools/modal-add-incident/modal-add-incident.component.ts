import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { filter, switchMap, takeUntil, map, debounceTime } from 'rxjs/operators';
import { of, Subject, Observable, forkJoin, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ResourcesService } from 'app/services/resources.service';
import { ModalAddIncidentService } from 'app/dashboard/module-sections/shared/table/table-tools/modal-add-incident/modal-add-incident.service';
import { ModuleModel } from 'app/dashboard/organization/models';
import { Store } from 'app/services/store/store';
import { DetailsService } from 'app/dashboard/module-sections/threats/details/details.service';

interface resourceIssuePair {
  resourceId: any;
  issues: any;
}
@Component({
  selector: 'app-modal-add-incident',
  templateUrl: './modal-add-incident.component.html',
  styleUrls: ['./modal-add-incident.component.scss']
})
export class ModalAddIncidentComponent implements OnDestroy, OnInit {
  @Input()
  set isModalOpen(e) {
    if (e) {
      this.initData();
    }
    this._isModalOpen = e;
  }

  get isModalOpen() {
    return this._isModalOpen;
  }

  @Input()
  set resource(e) {
    this._resource = e;
  }

  get resource() {
    return this._resource;
  }

  @Output() closeModal = new EventEmitter();

  emptyFieldItem: string;
  emptyFieldType: string;
  activeOrganization: any;
  loading = false;
  isContextModule: boolean;
  isModules: any;
  isRoles: boolean;
  customerRoles: any;
  roles: any;
  fromExisting = false;
  _resource: any[];
  isMenuOpened = false;
  isTypeOpened = false;
  list = [];
  types = [];
  incidentName = '';
  selectedType: any;
  selectedItem: any;
  typeDisabled = false;
  incidentDisabled = true;
  moduleName: string;
  activeModule: ModuleModel;
  errorMsg: any;
  moduleId: number;
  issuesList: any;
  filteredIssuesList = [];
  issuesTypes: any;
  filterIssuesTypes = [];
  currentValue = '';
  showSelectCtrl = true;
  resourceIssued: any[];
  currentContext$: Observable<any>;
  resources: any[];
  _isModalOpen = false;
  usersList = [];
  searchValue = '';
  selectedUser = undefined;
  isLoadingUsers = false;
  openDropdown = false;
  search$ = new BehaviorSubject('');
  private readonly destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private resourcesService: ResourcesService,
    private modalAddIncidentService: ModalAddIncidentService,
    private store: Store,
    private detailsService: DetailsService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.modalAddIncidentService.currentContext$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((context) => {
          if (context?.currentOrganization && context?.currentModule?.id) {
            this.activeOrganization = context.currentOrganization;
            this.activeModule = context.currentModule;
            this.moduleName = this.activeModule.moduleName;
            this.isContextModule = true;
            this.moduleId = this.activeModule.id;
            return this.resourcesService.getResourcesIssued(this.moduleId, this.moduleName);
          } else {
            return of(null);
          }
        })
      )
      .subscribe((res: any) => {
        if (res) {
          const list = res.list.map((r) => r.id);
          this.resourceIssued = list.filter((item, index) => list.indexOf(item) === index);
        }
      });

    this.store
      .select('roleList')
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((res: any) => {
        this.roles = res;
        this.customerRoles = res.grants.customer;
        this.isRoles = true;
      });

    this.resourcesService
      .getResourceIssueSubject()
      .pipe(takeUntil(this.destroy$))
      .subscribe((issue) => {
        if (JSON.stringify(issue) !== '{}') {
          return issue;
        }
      });
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

  filterIssuesType(event: any) {
    const { value } = event.target;
    this.filterIssuesTypes = this.issuesTypes.filter(({ label }: any) =>
      label.toUpperCase().includes(value.toUpperCase())
    );
  }

  filterIssuesList(event: any) {
    const { value } = event.target;
    this.filteredIssuesList = this.issuesList
      .filter(({ title }: any) => title.toUpperCase().includes(value.toUpperCase()))
      .map(({ id, title }: any) => ({ label: title, value: id }));
  }

  get isDisabledAcceptBtn(): boolean {
    return this.loading || this.fromExisting ? this.failOnItem() : this.failOnType();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initData() {
    if (this.isContextModule && !this.setAllowedCustomers()) {
      if (!this.isTrial()) {
        this.getIssuesByTypes();
        this.getIssuesByModule();
        this.initSubject();
      }
      this.isContextModule = false;
    }
  }

  isGlobalResearcher() {
    const grs = this.roles.grants;
    return grs.globalCustomer.indexOf(this.activeOrganization.id) >= 0;
  }

  setAllowedCustomers() {
    return this.isGlobalResearcher() || this.customerRoles.indexOf(this.activeModule.id) >= 0;
  }

  getIssuesByTypes() {
    if (!this.issuesTypes) {
      this.resourcesService
        .getIssuesByTypes()
        .pipe(takeUntil(this.destroy$))
        .subscribe((types) => {
          this.issuesTypes = types.filter(({ label }: any) => label !== '');
          this.filterIssuesTypes = this.issuesTypes;
          this.cdr.detectChanges();
        });
    }
  }

  getIssuesByModule(force = false) {
    if (!this.issuesList || force) {
      this.resourcesService
        .getIssuesByModule()
        .pipe(takeUntil(this.destroy$))
        .subscribe((issues) => {
          this.issuesList = issues.items.filter(({ title }: any) => title !== '');
          this.filteredIssuesList = this.issuesList.map(({ id, title }: any) => ({ label: title, value: id }));
          this.cdr.detectChanges();
        });
    }
  }

  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
    this.isTypeOpened = false;
  }

  toggleType() {
    this.isTypeOpened = !this.isTypeOpened;
    this.isMenuOpened = false;
  }

  clickItem(item) {
    const issueFound = this.issuesList.find((issue) => issue.id === Number(item));
    this.selectedItem = issueFound;
    this.closeDropdowns.call(this);
  }

  clickType(item) {
    this.selectedType = item;
    this.closeDropdowns.call(this);
  }

  enableTypeIncident(fromExisting: boolean, typeDisabled: boolean, incidentDisabled: boolean) {
    this.fromExisting = fromExisting;
    this.typeDisabled = typeDisabled;
    this.incidentDisabled = incidentDisabled;
    this.reset.call(this);
  }

  enableType() {
    this.enableTypeIncident(false, false, true);
  }

  enableIncident() {
    this.enableTypeIncident(true, true, false);
  }

  failOnType() {
    return this.incidentName.trim().length === 0 && this.incidentDisabled;
  }
  failOnItem() {
    return this.typeDisabled && !this.selectedItem;
  }

  onSave() {
    const subject = new Subject<void>();
    const obs$ = subject.asObservable();
    this.loading = true;
    const payload = {
      isNewIncident: this.incidentDisabled,
      newIncident: this.selectedType || '',
      username: this.selectedUser?.username || '',
      existingIncident: this.selectedItem?.id ? this.selectedItem.id : undefined,
      name: this.incidentName
    };

    let resIds = [];
    this.resources = JSON.parse(JSON.stringify(this._resource));

    obs$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (payload.isNewIncident) {
        this.modalAddIncidentService
          .createIncident(payload.name, payload.newIncident, '', payload.username)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((body) => {
              return this.modalAddIncidentService.assignIncident(resIds, body.issueId);
            })
          )
          .subscribe(
            () => {
              const [data, length] = this.setLengthAndResource(resIds);
              this.resourcesService.setUpdateThreatsTableSubject({ length, resourceId: data });
              this.detailsService.setUpdateResourceSubject({ delete: false });
              this.getIssuesByModule(true);
              this.loading = false;
              this.toastrService.success('Incident was succesfully created', 'Success');
              this.close();
            },
            () => {
              const [data] = this.setLengthAndResource(resIds);
              this.resourcesService.setUpdateThreatsTableSubject({ length: 0, resourceId: data });
              this.loading = false;
              this.toastrService.error(
                'There was an error while creating and assigning the issue, please try again',
                'Error'
              );
            }
          );
      } else {
        this.modalAddIncidentService.assignIncident(resIds, payload.existingIncident).subscribe(
          (res) => {
            const [data, length] = this.setLengthAndResource(resIds);
            this.resourcesService.setUpdateThreatsTableSubject({ length, resourceId: data });
            this.detailsService.setUpdateResourceSubject({ delete: false });
            this.getIssuesByModule(true);
            this.loading = false;
            if (res?.not_assigned?.length && (resIds.length === 1 || Object.keys(resIds).length)) {
              this.toastrService.error('The selected issue is either closed or already assigned', 'Error');
            } else {
              this.toastrService.success('The resource has been added to the Incident', 'Success');
            }
            this.close();
          },
          () => {
            const [data] = this.setLengthAndResource(resIds);
            this.resourcesService.setUpdateThreatsTableSubject({ length: 0, resourceId: data });
            this.loading = false;
            this.toastrService.error('The selected issue is either closed or already assigned', 'Error');
          }
        );
      }
    });

    if (this.resources.length > 1) {
      this.getAssignableIds()
        .pipe(takeUntil(this.destroy$))
        .subscribe((ids) => {
          resIds = ids;
          subject.next();
        });
    } else {
      resIds = this.resources;
      subject.next();
    }
  }

  setLengthAndResource(resIds: any[]) {
    let data;
    let length;
    if (resIds.length === 1) {
      length = 1;
      data = resIds[0];
    } else if (resIds.length === 0) {
      length = 0;
      data = 0;
    } else {
      length = resIds.length;
      data = resIds;
    }
    return [data, length];
  }

  close() {
    this.closeModal.emit();
    this.reset.call(this);
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpened = false;
    }
  }

  reloadSelectCtrl() {
    this.showSelectCtrl = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showSelectCtrl = true;
      this.cdr.detectChanges();
    }, 0);
  }

  private isTrial() {
    return this.roles && this.roles.trial;
  }

  private closeDropdowns() {
    this.isTypeOpened = false;
    this.isMenuOpened = false;
  }

  private reset() {
    this.incidentName = '';
    this.selectedType = undefined;
    this.selectedItem = undefined;
    this.closeDropdowns();
    this.reloadSelectCtrl();
  }

  private getAssignableIds(): Observable<any> {
    const idsIssued = this.resources.filter((res) => this.resourceIssued.includes(res));
    const requests: any[] = [];
    const resourcesIssues: resourceIssuePair[] = [];
    const idsResult: any[] = [];

    if (idsIssued.length) {
      idsIssued.forEach((id) => {
        resourcesIssues.push({ resourceId: id, issues: null });
        requests.push(this.resourcesService.getResourceOpenIssues(this.moduleId, this.moduleName, id));
      });

      return forkJoin(requests).pipe(
        takeUntil(this.destroy$),
        map((response) => {
          response.forEach((res, index) => {
            resourcesIssues[index].issues = res;
          });

          this.resources.forEach((resId) => {
            const incidentsDetect = resourcesIssues.filter((elem) => {
              if (elem.resourceId === resId) {
                return elem.issues.find((e) => e.id === this.selectedItem?.id);
              }
            });

            if (incidentsDetect.length) {
              idsResult.push(...incidentsDetect);
            }
          });
          const incidentDetectIds = idsResult.map((e) => e.resourceId);
          return this.resources.filter((e) => !incidentDetectIds.includes(e));
        })
      );
    } else {
      return of(this.resources.map((res) => res));
    }
  }
}
