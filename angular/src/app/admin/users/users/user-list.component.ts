import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  template: `
    <main-header-v1 [title]="'Users'" [arrayTabs]="arrayTabs" [(active)]="tabActive">
      <app-admin-users *ngIf="tabActive === arrayTabs[0]"></app-admin-users>
      <app-admin-groups *ngIf="tabActive === arrayTabs[1]"></app-admin-groups>
    </main-header-v1>
  `
})
export class UserListComponent {
  arrayTabs = ['User List', 'Group List'];
  tabActive = this.arrayTabs[0];

  constructor() {}
}
