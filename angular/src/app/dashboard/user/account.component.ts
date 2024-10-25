import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsideService } from 'app/aside/aside.service';
import { AuthService } from 'app/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserAccountService } from './account.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class UserAccountComponent implements OnInit, OnDestroy {
  currentUser: any;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private userAccountService: UserAccountService,
    private auth: AuthService,
    private asideService: AsideService
  ) {}

  ngOnInit() {
    this.initUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initUserData() {
    this.userAccountService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((account) => {
        this.currentUser = account;
      });
  }

  close() {
    this.asideService.reset();
  }

  logout() {
    this.asideService.reset();
    this.auth.logout();
  }
}
