import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { path } from '../../../services/http-utils.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ThreatContextNavigationService } from '../threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'mitre-attack-navigator',
  template: `
    <div class="frame-container">
      <iframe
        [style.display]="isLoadingContent || errorMessage ? 'none' : 'block'"
        [src]="attackNavigatorURL"
        width="100%"
        height="100%"
        frameborder="0"
        (load)="handleOnLoad($event)"
        (error)="handleOnError()"
      ></iframe>
      <div class="text-center error-box">
        <is-data-is-loading [isLoading]="isLoadingContent" [errorMsj]="errorMessage"></is-data-is-loading>
      </div>
    </div>
  `,
  styleUrls: ['./mitre-attack-navigator.component.scss']
})
export class MitreAttackNavigatorComponent implements OnInit {
  attackNavigatorURL: SafeResourceUrl;
  isLoadingContent = true;
  errorMessage = null;
  orgId;
  modId;
  path = '';

  _searchQueryParams;
  @Input()
  set searchQueryParams(e) {
    this._searchQueryParams = e;
    this.setAttackNavigatorURL(true);
  }

  get searchQueryParams() {
    return this._searchQueryParams;
  }

  @Output() contentLoaded: EventEmitter<null> = new EventEmitter();
  @Output() clickedItem: EventEmitter<null> = new EventEmitter();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private orgService: OrganizationService,
    private threatContextNavigationService: ThreatContextNavigationService,
    private router: Router
  ) {
    this.path = window.location.origin;
  }

  @HostListener('window:message', ['$event']) onPostMessage(event) {
    const data = event.data;

    if (data?.metadata?.length) {
      this.clickedItem.emit();
      const id = data.metadata[0].value;
      const name = data.metadata[1].value;
      const route = `/dashboard/organizations/${this.orgId}/modules/${this.modId}/threat_context/attack-patterns/${id}`;
      const navigation = this.threatContextNavigationService.getNavigation(name, `attack-patterns/${id}`);
      const query = { navigation };

      if (data.isCtrl) {
        const search = new URLSearchParams(query).toString();
        const url = `${this.path}${route}?${search}`;
        window.open(url, '_blank');
      } else {
        this.router.navigate([route], { queryParams: query });
      }
    } else if (data && data.isError) {
      this.errorMessage =
        'Unfortunately, it was not possible to load the MITRE ATT&CK matrix at this moment. Please, contact our support team to provide more details about this problem.';
    }
  }

  ngOnInit(): void {
    this.orgService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        if (context.currentOrganization && context.currentModule) {
          this.orgId = context.currentOrganization.id;
          this.modId = context.currentModule.id;
        }
      });
  }

  private setAttackNavigatorURL(reload = false) {
    this.errorMessage = '';
    const myFrame = document.querySelector('iframe');

    const parameters = this.searchQueryParams;
    const query = parameters && parameters.includes('fuzzy_filter') ? parameters : `dork=${parameters}`;
    const thiappAPI = parameters ? `/api/v1/attck/threat-actor/?${query}` : '/api/v1/attck/threat-actor/';
    const gateway = `${path}/gateway?notcache=${new Date().getTime()}`;
    const token = this.authService.token;
    const server = `${this.path}/attack/index.html`;
    const ATTACK_URL = `${server}#layerURL=${gateway}&token=${token}&apiId=THIAPP&requestType=GET&url=${thiappAPI}`;
    this.attackNavigatorURL = this.sanitizer.bypassSecurityTrustResourceUrl(ATTACK_URL);
    if (reload) {
      this.isLoadingContent = true;
      const html = `<iframe [src]="${this.attackNavigatorURL}" ></iframe>`;
      const iframeNow = document.getElementsByTagName('iframe')[0];

      document.getElementsByTagName('iframe')[0].remove();

      document.getElementsByClassName('frame-container')[0].appendChild(iframeNow);
    }
  }

  private handleOnLoad(evt) {
    if (evt.target.src !== '') {
      this.isLoadingContent = false;
      this.contentLoaded.emit();
    }
  }

  private handleOnError() {
    this.isLoadingContent = false;
    this.errorMessage = 'Failed to get data from API!';
    this.contentLoaded.emit();
  }
}
