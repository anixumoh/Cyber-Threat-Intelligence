import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
@Component({
  selector: 'app-empty-grants',
  templateUrl: './empty-grants.component.html',
  styleUrls: ['./empty-grants.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmptyGrantsComponent {
  constructor(private auth: AuthService) {}

  logOut() {
    this.auth.logout();
  }
}
