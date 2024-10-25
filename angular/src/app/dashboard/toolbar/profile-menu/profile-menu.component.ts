import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { AsideService } from '../../../aside/aside.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent implements OnInit, OnDestroy {
  firstLeter: string = '-';
  private readonly destroy$ = new Subject<void>();

  constructor(private asideService: AsideService, private userAccountService: UserAccountService) {}

  ngOnInit() {
    this.userAccountService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.firstLeter = user?.username?.[0]?.toUpperCase() || 'U';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openProfile() {
    this.asideService.setShowAsideSubject('profile', null);
  }
}
