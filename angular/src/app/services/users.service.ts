import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class UsersService implements OnDestroy {
  organizationSubscription: Subscription;
  modId: any;

  constructor(private http: HttpUtilsService, private organizationService: OrganizationService) {
    this.organizationSubscription = this.organizationService.getCurrentContext().subscribe((context) => {
      if (
        context.currentModule &&
        context.currentModule.id &&
        context.currentOrganization &&
        context.currentOrganization.id
      ) {
        this.modId = context.currentModule.id;
      }
    });
  }

  ngOnDestroy() {
    if (this.organizationSubscription) {
      this.organizationSubscription.unsubscribe();
    }
  }

  getUsersList(): Observable<any> {
    return this.http.get(`${path}/user/authorized/module/${this.modId}`).pipe(
      map((res) => {
        return {
          list: res,
        };
      })
    );
  }
}
