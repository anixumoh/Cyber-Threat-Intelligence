import { Injectable } from '@angular/core';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SidebarService {
  open = true;
  openSubject = new BehaviorSubject<boolean>(this.open);

  constructor(private accountService: UserAccountService) {
    this.accountService.getCurrentState().subscribe((state) => {
      if (state && state.default) {
        this.open = state.default.sidebarStatus;
        this.openSubject.next(state.default.sidebarStatus);
      }
    });
  }

  setSidebarStatus(value: boolean) {
    this.open = value;
    this.openSubject.next(value);
    this.accountService.setSidebarStatus(value);
  }

  getSidebarStatus() {
    return this.openSubject;
  }
}
