import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CommonAdmin } from '../../shared/common-admin';
import { LabelsService } from '../labels.service';
import { defaultColorsRGB } from '../../../utils/functions';
import { OrganizationService } from '../../organization/organization.service';
import { Grants } from '../../../services/grants/grants';

@Component({
  selector: 'app-new-edit-labels',
  templateUrl: './new-edit-labels.component.html',
  styleUrls: ['./new-edit-labels.component.scss']
})
export class NewEditLabelsComponent extends CommonAdmin implements OnInit {
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  form: UntypedFormGroup;
  view = <any>{};
  canEditProtected = false;
  listOrg = [];
  listType = [];
  listModOrg = [];
  loading = false;
  colors = defaultColorsRGB;
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected labelService: LabelsService,
    protected orgService: OrganizationService,
    protected fb: UntypedFormBuilder,
    protected grants: Grants,
    private toastrService: ToastrService
  ) {
    super();
  }

  get values() {
    return this.form.getRawValue();
  }

  ngOnInit() {
    this.instanceForm();
    this.getOrg();
    this.getType();

    this.canEditProtected = this.grants.isMaster() || this.grants.isSuperAdmin();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  instanceForm(data = null, isNew = false) {
    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      label: [data && data.label ? data.label : '', Validators.required],
      labelTypeId: [data && data.labelTypeId ? data.labelTypeId : ''],
      labelProtected: [data && data.labelProtected ? data.labelProtected : false],
      prioritized: [data && data.prioritized ? data.prioritized : false],
      bgColorHex: [data && data.bgColorHex ? data.bgColorHex : '#ffffff', Validators.required],
      textColorHex: [data && data.textColorHex ? data.textColorHex : '#000000', Validators.required],
      organizationId: [data && data.organizationId ? data.organizationId : ''],
      moduleId: [data && data.moduleId ? data.moduleId : '']
    });

    this.form
      .get('organizationId')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => this.getMod(val));

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
    this.loading = true;
    this.labelService
      .create(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => {
          this.loading = false;
          this.onSuccess.emit(tz);
        },
        () => {
          this.loading = false;
          this.toastrService.error('There was an error while creating the label.', 'Error');
        }
      );
  }

  edit(obj) {
    this.loading = true;
    this.labelService
      .edit(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => this.onSuccess.emit(tz),
        (e) => {
          this.loading = false;
          this.toastrService.error('There was an error while editing the label.', 'Error');
        }
      );
  }

  getOrg() {
    this.orgService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => {
        this.listOrg = [{ id: '', name: 'Global' }, ...tz];
      });
  }

  getType() {
    this.labelService
      .getType()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => (this.listType = tz));
  }

  getMod(idOrg) {
    if (idOrg) {
      this.listModOrg = [];
      this.orgService
        .getModulesByOrg(idOrg)
        .pipe(takeUntil(this.destroy$))
        .subscribe((tz) => {
          this.listModOrg = [{ id: '', name: 'NONE' }, ...tz];
        });
    }
  }

  textColor(background) {
    let retorno = '#000000';
    if (background && !(background === 'rgba(255,255,255,1)' || background === 'rgba(238,238,238,1)')) {
      retorno = '#FFFFFF';
    }
    return retorno;
  }

  selectColor(color) {
    this.form.controls['bgColorHex'].setValue(this.rgbaToHexa(color));
    this.form.controls['textColorHex'].setValue(this.textColor(color));
  }

  rgbaToHexa(color) {
    let retorno = '';
    if (color && color.indexOf('(') !== -1 && color.indexOf(',') !== -1 && color.indexOf(')') !== -1) {
      let c = color.split('(')[1].split(')')[0].split(',');
      let a = parseInt(c[0]) < 10 ? '0' + c[0] : parseInt(c[0]).toString(16);
      let b = parseInt(c[1]) < 10 ? '0' + c[1] : parseInt(c[1]).toString(16);
      let d = parseInt(c[2]) < 10 ? '0' + c[2] : parseInt(c[2]).toString(16);
      retorno = '#' + a + b + d;
    }
    return retorno;
  }
}
