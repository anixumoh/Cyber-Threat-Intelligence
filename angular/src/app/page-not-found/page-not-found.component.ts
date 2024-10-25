import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SvelteService } from 'app/services/svelte.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(private router: Router, private svelteService: SvelteService) {}

  ngOnInit() {
    this.svelteService.safeSendEvent('angular-not-found').then(() => {
      this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.svelteService.safeSendEvent('angular-found');
        }
        if (event instanceof NavigationEnd) {
          this.svelteService.safeSendEvent('angular-not-found');
        }
      });
    });
  }

  ngOnDestroy() {
    this.svelteService.safeSendEvent('angular-found');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
