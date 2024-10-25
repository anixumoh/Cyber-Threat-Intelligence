import { Injectable } from '@angular/core';
import { getEnvVars } from 'app/utils/functions';
import { Router } from '@angular/router';

@Injectable()
export class NewTabService {
  path = '';

  constructor(private router: Router) {
    this.path = getEnvVars().origin;
  }

  openNewTab(event, route, query?) {
    if (event.ctrlKey || event.metaKey) {
      const search = new URLSearchParams(query).toString();
      const separator = search ? '?' : '';
      const url = `${this.path}${route}${separator}${search}`;
      window.open(url, '_blank');
    } else {
      this.router.navigate([route], { queryParams: query });
    }
  }
}
