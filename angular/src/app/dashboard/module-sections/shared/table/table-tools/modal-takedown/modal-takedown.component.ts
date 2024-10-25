import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalTakedownService } from './modal-takedown.service';

@Component({
  selector: 'app-modal-takedown',
  templateUrl: './modal-takedown.component.html',
  styleUrls: ['./modal-takedown.component.scss'],
})
export class ModalTakedownComponent implements OnInit, OnDestroy {
  @Input()
  set resource(res) {
    if (res !== this._resource) {
      this._resource = res;
    }
  }

  get resource() {
    return this._resource;
  }

  @Input() openModal;
  @Output() takeDownEmitter = new EventEmitter();
  @Output() close = new EventEmitter();

  isLoading = false;
  _resource: any;
  errorMails = [];
  correctMails = [];
  takedown = {
    reason: {
      text: null,
      errorMessage: null,
      validatorReason(a) {
        return a.length > 6;
      },
    },
    email: {
      values: null,
      errorMessage: null,
      validatorEmail(mail) {
        if (mail.length) {
          return !!mail.match(
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
          );
        }
      },
    },
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private modalTakedownService: ModalTakedownService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  postTakeDown(takedown) {
    this.isLoading = true;
    const body = {
      reason: takedown.reason.text,
      requester: 'userName',
      emailsToReply: takedown.email.values.split(',').map((email) => {
        return email.trim();
      }),
      resourceId: String(this.resource.id),
    };
    this.modalTakedownService
      .postTakeDown(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.isLoading = false;
        this.takeDownEmitter.emit();
        this.closeTakedown();
      });
  }

  saveTakedown() {
    if (this.checkCorretcTextArea()) {
      this.postTakeDown(this.takedown);
    }
  }

  checkCorretcTextArea() {
    this.takedown.email.errorMessage = null;
    this.takedown.reason.errorMessage = null;
    const reasonCondition = this.correctValidatorReason(this.takedown.reason.text);
    const emailCondition = this.correctValidatorEmail(this.takedown.email.values);
    return reasonCondition && emailCondition;
  }

  correctValidatorReason(a) {
    if (this.takedown.reason.text) {
      const conditionLength = this.takedown.reason.validatorReason(a);
      if (!conditionLength) {
        this.takedown.reason.errorMessage = 'This field is too short';
      }
      return conditionLength;
    }
    this.takedown.reason.errorMessage = 'This field is a requirement';
    return false;
  }

  correctValidatorEmail(emailText) {
    this.errorMails = [];
    this.correctMails = [];
    if (this.takedown.email.values) {
      let arrayOfEmails = emailText.split(',');
      arrayOfEmails.forEach((email) => {
        let emailToRegex = email.trim();
        if (this.takedown.email.validatorEmail(emailToRegex)) {
          if (!this.checkDuplicates(this.correctMails, emailToRegex)) {
            this.correctMails.push(emailToRegex);
          }
        } else {
          if (!this.checkDuplicates(this.errorMails, emailToRegex)) {
            this.errorMails.push(emailToRegex);
          }
        }
      });
      if (this.errorMails.length > 0) {
        let textErrorArray = this.errorMails.toString();
        this.takedown.email.errorMessage = `Please correct this fields: ${textErrorArray}`;
        return false;
      } else {
        return true;
      }
    } else {
      this.takedown.email.errorMessage = 'This field is a requirement';
      return false;
    }
  }

  checkDuplicates(array, word) {
    return array.includes(word);
  }

  resetValues() {
    this.takedown.reason.text = null;
    this.takedown.email.values = null;
    this.errorMails = [];
    this.correctMails = [];
    this.takedown.reason.errorMessage = null;
    this.takedown.email.errorMessage = null;
  }

  closeTakedown() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    this.resetValues();
    this.close.emit('close');
  }
}
