import { Component, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SvelteService } from './services/svelte.service';
import { AuthService } from './services/auth.service';
import { LocalStorageService } from './services/store/local-store.service';
import { SidebarService } from './services/sidebar.service';
import { ThreatDetailService } from './services/threat-detail.service';
import { Store } from './services/store/store';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  preventRoute = false;

  constructor(
    private router: Router,
    private svelteService: SvelteService,
    private authService: AuthService,
    public sidebarService: SidebarService,
    private localStorageService: LocalStorageService,
    private threatDetailService: ThreatDetailService,
    private store: Store
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this.preventRoute) {
          this.svelteService.safeSendEvent('angular-navigation-end', { url: event.url });
        }
        this.svelteService.safeSendEvent('angular-route-loaded');
      }
    });
  }

  @HostListener('document:svelteNavitagionEnd', ['$event'])
  onSvelteNavitagionEnd(event: CustomEvent) {
    this.preventRoute = true;
    this.router.navigateByUrl(event.detail.url).then(() => {
      this.preventRoute = false;
    });
  }

  @HostListener('document:svelte-ping', ['$event'])
  onSveltePing() {
    this.svelteService.sendEvent('angular-ready');
  }

  @HostListener('document:svelte-ready', ['$event'])
  onSvelteReady() {
    this.svelteService.setSvelteReady();
  }

  @HostListener('document:send-token', ['$event'])
  onSendToken(event: CustomEvent) {
    const token = event.detail.token;
    this.authService.saveLoginToken(token);
  }

  @HostListener('document:svelte-logout', ['$event'])
  onLogOut() {
    this.authService.isLoggedIn = false;
    this.localStorageService.clear().subscribe();
    this.store.reset();
    this.router.navigate(['/login']);
  }

  @HostListener('document:svelte-sidebar-expand', ['$event'])
  onSidebarExpand(event: CustomEvent) {
    this.sidebarService.setSidebarStatus(event.detail.expanded);
  }

  @HostListener('document:svelte-threat-list-cache', ['$event'])
  onThreatListCache(event: CustomEvent) {
    this.threatDetailService.setThreatDetails(event.detail);
  }
}
