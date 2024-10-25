import {
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AsideService } from './aside.service';
import { UserAccountComponent } from '../dashboard/user/account.component';
import { FiltersGenericNewEditComponent } from '../dashboard/module-sections/modulesettings/detail/filters-settings/filters-generic-new-edit/filters-generic-new-edit.component';
import { AlertsAsideComponent } from '../dashboard/module-sections/alerts/alerts-aside/alerts-aside.component';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class AsideComponent implements OnInit {
  @ViewChild('asideContainer', { read: ViewContainerRef }) container;
  @ViewChild('aside', { read: ElementRef }) aside: ElementRef;

  componentRef: ComponentRef<any>;
  componentList = {
    profile: UserAccountComponent,
    advancedSettings: FiltersGenericNewEditComponent,
    alerts: AlertsAsideComponent
  };
  data = '';
  asideTemplate = '';
  isShowAside = false;
  id = undefined;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private asideService: AsideService,
    private resolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.asideService
      .getDataObs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.data = res;
        this.cd.markForCheck();
      });

    this.asideService.openDrawerSubject.subscribe((isOpenSide: boolean) => {
      this.initData(isOpenSide);
    });
  }

  initData(isOpenSide: boolean) {
    this.isShowAside = isOpenSide;
    this.cd.markForCheck();
    if (isOpenSide) {
      this.asideService.idAdvanced.subscribe((id: number | undefined) => {
        this.id = id;
        this.asideService.templateType.subscribe((template: string) => {
          this.asideTemplate = template;
          template && isOpenSide && this.buildTemplate();
        });
      });
    }
  }

  buildTemplate() {
    this.container?.clear?.();
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(
      this.componentList[this.asideTemplate]
    );
    this.componentRef = this.container.createComponent(factory);
    if (this.id) {
      this.componentRef.instance.settingId = 'filters';
      this.componentRef.instance.resourceId = this.id;
      this.componentRef.instance.editMode = true;
    }
  }

  isContained(event) {
    return this.aside && this.aside.nativeElement.contains(event.target);
  }

  onClickOutside(event) {
    if (
      event.target.id !== 'profileButton' &&
      event.target.id !== 'profileSpan' &&
      this.isShowAside &&
      !this.isContained(event)
    ) {
      this.closeMenu();
    }
  }

  closeMenu() {
    this.container?.clear?.();
    this.asideTemplate = '';
    this.isShowAside = false;
    this.id = '';
    this.cd.markForCheck();

    if (this.asideService.openDrawerSubject.getValue()) {
      this.asideService.reset();
    }
  }
}
