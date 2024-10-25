import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { ModalService } from 'app/dashboard/module-sections/shared/modal/modal.service';
import { ResourcesService } from 'app/services/resources.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Router } from '@angular/router';
import { DetailsService } from 'app/dashboard/module-sections/threats/details/details.service';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-table-tools-resource-issues',
  templateUrl: './resource-issues.component.html',
  styleUrls: ['./resource-issues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceIssuesComponent implements OnInit, OnDestroy {
  currentModule: any;
  currentOrganization: any;
  public subscriptionsList: Subscription[] = [];
  _context: any;
  routes;
  isLoading = false;

  @Input() selectedItemIssues = [];
  @Input() resource;
  @Input() loading = false;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private resourceService: ResourcesService,
    public organizationService: OrganizationService,
    private cd: ChangeDetectorRef,
    private detailsService: DetailsService,
    private grants: Grants
  ) {}

  ngOnInit() {
    const s = this.organizationService.getCurrentContext().subscribe((context) => {
      this.currentOrganization = context.currentOrganization;
      this.currentModule = context.currentModule;
    });
    this.subscriptionsList.push(s);
  }

  ngOnDestroy() {
    this.subscriptionsList.forEach((subscription) => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
  }

  navigateToIssue(selected) {
    this.router.navigate([
      `/dashboard/organizations/${this.currentOrganization.id}/modules/${this.currentModule.id}/incidents/${selected.id}`
    ]);
  }

  setCloseTheModalComponent(selectedItemIssues) {
    this.modalService.setCloseTheModal(true, selectedItemIssues);
  }

  deleteIssueIncident(issueId: number, resource: any) {
    if (!this.grants.isCustomerOrOperator()) {
      this.isLoading = true;
      this.cd.detectChanges();
      const s = this.modalService
        .IssueIncidentDeletion(issueId, resource.id)
        .pipe(
          switchMap(() => {
            // View update
            this.selectedItemIssues = this.selectedItemIssues.filter((issue) => {
              return issue.id !== issueId;
            });
            if (!this.cd.detectChanges['destroyed']) {
              this.cd.detectChanges();
            }
            return this.resourceService.listIssuesByResource(resource.id);
          }),
          finalize(() => {
            this.isLoading = false;
            this.cd.detectChanges();
          })
        )
        .subscribe((list) => {
          this.resourceService.setUpdateThreatsTableSubject({ length: list.length, resourceId: resource.id });
          this.detailsService.setUpdateResourceSubject({ length: list.length, delete: true });
          this.isLoading = false;
          this.cd.detectChanges();
        });
      this.subscriptionsList.push(s);
    }
  }
}
