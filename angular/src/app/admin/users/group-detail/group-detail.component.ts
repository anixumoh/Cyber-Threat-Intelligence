import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonAdmin } from '../../shared/common-admin';
import { UsersService } from '../users.service';

@Component({
  selector: 'group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent extends CommonAdmin implements OnInit {
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();
  groupSelected: any;
  usersSelected = [];
  private readonly destroy$ = new Subject<void>();

  constructor(protected userService: UsersService) {
    super();
  }

  ngOnInit() {
    if (this.groupSelected) {
      this.getGroupDetail(this.groupSelected.id);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getGroupDetail(id) {
    this.userService
      .getGroupDetail(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => {
        if (a && a.userMap) {
          const ids = Object.keys(a.userMap);
          if (ids.length) {
            for (const s of ids) {
              a.userMap[s].id = Number(s);
              this.usersSelected.push(a.userMap[s]);
            }
          } else {
            this.usersSelected.push({ name: 'no users', username: 'on this group' });
          }
        }
      });
  }

  goToEdit() {
    this.onSuccess.emit(null);
  }

  closeModal() {
    this.onCloseEmit.emit(null);
  }
}
