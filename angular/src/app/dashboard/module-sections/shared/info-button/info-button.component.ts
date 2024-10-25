import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfoButtonService } from './info-button.service';

@Component({
  selector: 'app-info-button',
  templateUrl: './info-button.component.html',
  styleUrls: ['./info-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InfoButtonComponent implements OnInit {
  @Input() activeModule;
  @Input() moduleName;

  infoModal = false;
  infoModalText;
  listModules;
  private readonly destroy$ = new Subject<void>();

  constructor(private infoButtonService: InfoButtonService) {}

  ngOnInit() {
    this.infoButtonService
      .getInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.listModules = data;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // MODAL INFO
  openInfoModal() {
    if (this.activeModule) {
      this.infoModalText = this.listModules[this.activeModule.moduleName];
      this.infoModal = true;
    } else if (this.moduleName) {
      this.infoModalText = this.listModules[this.moduleName];
      this.infoModal = true;
    }
  }

  closeInfoModal() {
    this.infoModal = false;
  }
}
