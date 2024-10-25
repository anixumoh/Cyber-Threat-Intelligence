import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonAdmin } from '../../shared/common-admin';
import { UsersService } from '../users.service';

@Component({
  selector: 'user-detail',
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent extends CommonAdmin implements OnInit {
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  userId: any;
  selectedUser = { firstBlock: [], secondBlock: [], thirdBlock: [], fourthBlock: [] };
  private readonly destroy$ = new Subject<void>();

  constructor(protected userService: UsersService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    if (this.userId) {
      this.getUserSelected();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserSelected() {
    this.userService
      .getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        for (const key of Object.keys(response)) {
          const obj = { type: this.getValue(key), value: response[key] };
          if (this.keysForFirstBlock(key)) {
            this.selectedUser.firstBlock.push(obj);
          } else if (this.keysForSecondBlock(key)) {
            this.selectedUser.secondBlock.push(obj);
          } else if (this.keysForthirdBlock(key)) {
            this.selectedUser.thirdBlock.push(obj);
          } else if (this.keysForFourthBlock(key)) {
            this.selectedUser.fourthBlock.push(obj);
          }
        }
      });
  }

  keysForFirstBlock(key) {
    const valid = ['name', 'firstSurname', 'secondSurname', 'email', 'username'];
    return valid.indexOf(key) !== -1;
  }

  keysForSecondBlock(key) {
    const valid = ['address', 'cellphone', 'telephone', 'job'];
    return valid.indexOf(key) !== -1;
  }

  keysForthirdBlock(key) {
    const valid = ['status', 'expirationTime', 'lastPasswordChangeTime', 'lastLoginAt', 'groups', 'timezone'];
    return valid.indexOf(key) !== -1;
  }

  keysForFourthBlock(key) {
    const valid = ['createdAt', 'updatedAt'];
    return valid.indexOf(key) !== -1;
  }

  goToEdit() {
    this.onSuccess.emit(null);
  }

  closeModal() {
    this.onCloseEmit.emit(null);
  }

  getValue(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase();
    });
  }
}
