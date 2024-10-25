import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalTwoStepValidationService } from './modal-two-step-validation.service';

@Component({
  selector: 'app-modal-two-step-validation',
  templateUrl: './modal-two-step-validation.component.html',
  styleUrls: ['./modal-two-step-validation.component.scss'],
})
export class ModalTwoStepValidationComponent implements OnInit, OnDestroy {
  @Input() openModal;
  @Input() QrImageSecret;
  @Output() twoStepVerificationEmitter = new EventEmitter();
  @Output() close = new EventEmitter();
  @Output() error = new EventEmitter();

  isLoading = false;
  imageToShow: any;
  verificationCode = {
    reason: {
      text: null,
      errorMessage: null,
      validatorReason(a) {
        return a.toString().length === 6;
      },
    },
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private modalTwoStepValidationService: ModalTwoStepValidationService, private _sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.QrImageSecret) {
      this.createImageForBase64(this.QrImageSecret.qr);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createImageForBase64(image) {
    this.imageToShow = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + image);
  }

  postTwoStepValidation(verificationCode) {
    this.isLoading = true;
    const body = {
      code: verificationCode.reason.text,
      secret: this.QrImageSecret.secret,
    };
    this.modalTwoStepValidationService
      .postTwoStepValidation(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.twoStepVerificationEmitter.emit();
          this.closeTwoStepValidationModal();
        },
        (err) => {
          this.isLoading = false;
          setTimeout(
            function () {
              this.verificationCode.reason.errorMessage = null;
            }.bind(this),
            5000
          );
          this.error.emit();
        }
      );
  }

  saveTwoStepValidation() {
    if (this.checkCorretcTextArea()) {
      this.postTwoStepValidation(this.verificationCode);
    }
  }

  checkCorretcTextArea() {
    this.verificationCode.reason.errorMessage = null;
    const reasonCondition = this.correctValidatorReason(this.verificationCode.reason.text);
    return reasonCondition;
  }

  correctValidatorReason(a) {
    if (this.verificationCode.reason.text) {
      const conditionLength = this.verificationCode.reason.validatorReason(a);
      if (!conditionLength) {
        this.verificationCode.reason.errorMessage = 'this field is invalid';
      }
      return conditionLength;
    }
    this.verificationCode.reason.errorMessage = 'This field is a requirement';
    return false;
  }

  resetValues() {
    this.verificationCode.reason.text = null;
    this.verificationCode.reason.errorMessage = null;
  }

  closeTwoStepValidationModal() {
    if (this.isLoading) {
      this.isLoading = false;
    }
    this.resetValues();
    this.close.emit('close');
  }
}
