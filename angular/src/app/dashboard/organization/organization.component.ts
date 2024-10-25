import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrganizationService } from './organization.service';
import { SidebarService } from 'app/services/sidebar.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {
  subscriptionsList: Subscription[] = [];
  sidebarStatus = true;

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    const watchOrganization = this.route.params
      .pipe(
        switchMap((params: Params) => {
          const selectedId = +params['id'];
          this.organizationService.setCurrentOrganizationId(selectedId);
          return this.organizationService.getModules(selectedId);
        })
      )
      .subscribe();
    this.subscriptionsList.push(watchOrganization);

    const watchSidebar = this.sidebarService.getSidebarStatus().subscribe((status) => {
      this.sidebarStatus = status;
    });
    this.subscriptionsList.push(watchSidebar);
  }

  ngOnDestroy() {
    this.unsubscribeList();
  }

  unsubscribeList() {
    this.subscriptionsList.forEach((observer, index) => {
      if (observer) {
        observer.unsubscribe();
      }
      if (index === this.subscriptionsList.length - 1) {
        this.subscriptionsList = new Array();
      }
    });
  }
}
