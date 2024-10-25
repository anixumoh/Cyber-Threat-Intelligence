import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThreatContextNavigationService, type ThreatContextNavigationItem } from './threat-context-navigation.service';

@Component({
  selector: 'threat-context-navigation',
  templateUrl: './threat-context-navigation.component.html',
  styleUrls: ['./threat-context-navigation.component.scss']
})
export class ThreatContextNavigationComponent implements OnInit, OnDestroy {
  @Input() set name(value: string) {
    this.threatContextNavigationService.setInitialName(value);
  }
  @Input() set path(value: string) {
    this.threatContextNavigationService.setInitialPath(value);
  }

  items: ThreatContextNavigationItem[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(private threatContextNavigationService: ThreatContextNavigationService) {}

  ngOnInit() {
    this.threatContextNavigationService.currentItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.items = items;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
