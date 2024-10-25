import { Component, OnInit, Input, ChangeDetectorRef, ViewRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { TcxLinkeableService } from './tcx-linkeable.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Component({
  selector: 'app-tcx-linkeable',
  templateUrl: './tcx-linkeable.component.html',
  styleUrls: ['./tcx-linkeable.component.scss'],
})
export class TcxLinkeableComponent implements OnInit, OnDestroy {
  @Input() value;
  @Input() checkForActors = false;
  @Input() isCreditCard = false;
  @Input() organizationId = false;
  id = null;
  moduleId;
  linkType;
  isDwLink = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private tcxLinkeableService: TcxLinkeableService,
    private ref: ChangeDetectorRef,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.organizationService
      .getCurrentModules()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((modules) => {
        const threatContextModule = modules.find((item) => item.type === 'THREAT_CONTEXT');
        const darkWebModule = modules.find((item) => item.type === 'DARK_WEB');

        if (this.value) {
          const value = this.value.toLowerCase();
          let promise;
          if (this.isCreditCard) {
            if (value.startsWith('threatactor:')) {
              if (threatContextModule) {
                this.organizationId = threatContextModule.organizationId;
                this.moduleId = threatContextModule.id;
              }

              this.isDwLink = false;
              promise = threatContextModule ? this.tcxLinkeableService.getActor(this.extractActorName(value)) : null;
            } else if (value.startsWith('pos ')) {
              if (threatContextModule) {
                this.organizationId = threatContextModule.organizationId;
                this.moduleId = threatContextModule.id;
              }

              this.isDwLink = false;
              promise = threatContextModule ? this.tcxLinkeableService.getTool(this.extractToolName(value)) : null;
            } else if (
              value.startsWith('telegram:') ||
              value.startsWith('irc:') ||
              value === 'hacktivism' ||
              value === 'marketplace' ||
              value === 'underground'
            ) {
              this.isDwLink = false;
            } else {
              if (darkWebModule) {
                this.organizationId = darkWebModule.organizationId;
                this.moduleId = darkWebModule.id;
              }

              this.isDwLink = true;
            }
          } else {
            if (threatContextModule) {
              this.organizationId = threatContextModule.organizationId;
              this.moduleId = threatContextModule.id;

              promise = value.startsWith('threatactor:')
                ? this.tcxLinkeableService.getActor(this.extractActorName(value))
                : this.tcxLinkeableService.getTool(this.extractToolName(value));
            } else {
              promise = null;
            }
          }

          if (promise) {
            promise.then((id) => {
              if (id) {
                this.id = id;
                if (!(this.ref as ViewRef).destroyed) {
                  this.ref.detectChanges();
                }
              }
            });
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasLinkFn() {
    const value = this.value.toLowerCase();
    if (!value || value === '-') {
      return false;
    }

    if (this.isCreditCard) {
      if (value.startsWith('threatactor:')) {
        return true;
      } else if (value.startsWith('pos ')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  getRedirectToDarkWeb() {
    const sw = this.value.replace(/(Telegram:|IRC:)/g, '');
    return `/dashboard/organizations/${this.organizationId}/modules/${this.moduleId}/search?searchWord=${sw}`;
  }

  showModal(event, type) {
    event.preventDefault();
    if (!this.moduleId) {
      this.tcxLinkeableService.showModal.next({ show: true, type });
    }
  }

  getRedirectToToolsLink() {
    if (this.id && this.moduleId) {
      let section = 'tools';
      if (this.checkForActors && this.value.toLowerCase().startsWith('threatactor:')) {
        section = 'actors';
      }
      return `/dashboard/organizations/${this.organizationId}/modules/${this.moduleId}/threat_context/${section}/${this.id}`;
    }
    return false;
  }

  private extractActorName(value: string): string {
    return value.split('threatactor:')[1].replace('_', ' ');
  }

  private extractToolName(value: string): string {
    if (this.isCreditCard) {
      if (value.startsWith('pos ')) {
        return value.split(' ')[1];
      } else {
        return '';
      }
    } else {
      return value;
    }
  }
}
