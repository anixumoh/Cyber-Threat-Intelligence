import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import { CommonAdmin } from '../../shared/common-admin';
import { LabelsService } from '../labels.service';

@Component({
  selector: 'app-new-edit-type-labels',
  templateUrl: './new-edit-type-labels.component.html',
  styleUrls: ['./new-edit-type-labels.component.scss']
})
export class NewEditTypeLabelsComponent extends CommonAdmin implements OnInit {
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  form: UntypedFormGroup;
  private readonly destroy$ = new Subject<void>();

  get values() {
    return this.form.getRawValue();
  }

  constructor(
    protected labelService: LabelsService,
    protected fb: UntypedFormBuilder,
    protected toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit() {
    this.instanceForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  instanceForm(data = null, isNew = false) {
    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      name: [data && data.name ? data.name : '', Validators.required]
    });

    this.isNew = isNew ? isNew : !data;
  }

  closeModal() {
    this.onCloseEmit.emit(null);
  }

  createEdit() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const obj = Object.assign({}, this.values);
    for (const key of Object.keys(obj)) {
      if (obj[key] === '' || obj[key] === null) {
        delete obj[key];
      }
    }
    this.isNew ? this.create(obj) : this.edit(obj);
  }

  create(obj) {
    this.labelService
      .createType(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => this.onSuccess.emit(tz),
        (e) => {
          this.toastrService.error(e.error.field, 'Error');
        }
      );
  }

  edit(obj) {
    this.labelService
      .editType(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => this.onSuccess.emit(tz),
        (e) => {
          this.toastrService.error(e.error.field, 'Error');
        }
      );
  }
}
