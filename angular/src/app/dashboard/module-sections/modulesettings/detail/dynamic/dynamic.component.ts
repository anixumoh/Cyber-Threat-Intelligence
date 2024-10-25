import {
  Component,
  Input,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  Injector,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EmailComponent } from 'app/dashboard/module-sections/modulesettings/detail/email/email.component';
import { DomainComponent } from 'app/dashboard/module-sections/modulesettings/detail/domain/domain.component';
import { IpComponent } from 'app/dashboard/module-sections/modulesettings/detail/ip/ip.component';
import { AlertComponent } from 'app/dashboard/module-sections/modulesettings/detail/alert/alert.component';
import { KeywordsComponent } from 'app/dashboard/module-sections/modulesettings/detail/keywords/keywords.component';
import { FilenameComponent } from 'app/dashboard/module-sections/modulesettings/detail/filename/filename.component';
import { ConfidentialComponent } from 'app/dashboard/module-sections/modulesettings/detail/confidential/confidential.component';
import { ClassifyComponent } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.component';
import { FeedsComponent } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.component';
import { TermsBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse.component';
import { Subscription } from 'rxjs';
import { FiltersSettingsComponent } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-settings.component';
import { RssBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse.component';
import { MarketplacesComponent } from 'app/dashboard/module-sections/modulesettings/detail/marketplaces/marketplaces.component';
import { TermsCustomComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom.component';

@Component({
    selector: 'dynamic-component',
    template: ` <div #dynamicComponentContainer></div> `
})
export class DynamicComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input()
  set componentData(data: { component: any; inputs: any }) {
    if (!data) {
      return;
    }
    this.data = data;
  }

  @Output() paginationChangeEmit = new EventEmitter<any>();

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

  currentComponent = null;
  currentSubscription: Subscription;
  private data: any;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.componentData && !changes.componentData.firstChange) {
      if (this.data && this.dynamicComponentContainer) {
        const inputProviders = Object.keys(this.data.inputs).map((inputName) => {
          return { provide: inputName, useValue: this.data.inputs[inputName] };
        });
        const options = {
          providers: inputProviders,
          parent: this.dynamicComponentContainer.injector,
        };
        const injector = Injector.create(options);
        const factory = this.resolver.resolveComponentFactory(this.data.component);
        const component = factory.create(injector);
        this.dynamicComponentContainer.insert(component.hostView);
        if (this.currentComponent) {
          this.currentComponent.destroy();
        }
        this.currentComponent = component;
      }
    }
  }

  ngAfterViewInit() {
    if (this.data && this.dynamicComponentContainer) {
      // Inputs need to be in the following format to be resolved properly
      const inputProviders = Object.keys(this.data.inputs).map((inputName) => {
        return { provide: inputName, useValue: this.data.inputs[inputName] };
      });

      const options = {
        providers: inputProviders,
        parent: this.dynamicComponentContainer.injector,
      };
      // let resolvedInputs = Injector.create(options);

      // We create an injector out of the data we want to pass down and this components injector
      const injector = Injector.create(options);

      // We create a factory out of the component we want to create
      const factory = this.resolver.resolveComponentFactory(this.data.component);

      // We create the component using the factory and the injector
      const component = factory.create(injector);

      // We insert the component into the dom container
      setTimeout(() => {
        this.dynamicComponentContainer.insert(component.hostView);
      });

      // Destroy the previously created component
      if (this.currentComponent) {
        this.currentComponent.destroy();
      }

      this.currentComponent = component;
    }
  }

  ngOnDestroy() {}
}
