import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonAdmin } from '../../shared/common-admin';
import { LabelsService } from '../labels.service';
import { defaultColorsRGB } from '../../../utils/functions';
import { OrganizationService } from '../../organization/organization.service';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'label-detail',
  templateUrl: './label-detail.component.html',
  styleUrls: ['./label-detail.component.scss']
})
export class LabelDetailComponent extends CommonAdmin implements OnInit {
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  form: UntypedFormGroup;
  view = <any>{};
  selectedLabel: any;
  labelToPrint = { firstBlock: [] };
  listOrg = [];
  listType = [];
  listModOrg = [];
  colors = defaultColorsRGB;
  isSuperAdmin = false;
  private readonly destroy$ = new Subject<void>();

  get values() {
    return this.form.getRawValue();
  }

  constructor(
    protected labelService: LabelsService,
    protected orgService: OrganizationService,
    protected fb: UntypedFormBuilder,
    protected grants: Grants
  ) {
    super();
  }

  ngOnInit() {
    this.isSuperAdmin = this.grants.isMaster() || this.grants.isSuperAdmin();
    this.instanceForm();
    this.transformSelectedLabel();
    /*    this.getOrg();
    this.getType();*/
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

  goToEdit() {
    this.onSuccess.emit(null);
  }

  create(obj) {
    this.labelService
      .create(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => this.onSuccess.emit(tz));
  }

  edit(obj) {
    this.labelService
      .edit(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => this.onSuccess.emit(tz));
  }

  transformSelectedLabel() {
    /*  const temp = JSON.parse(JSON.stringify(this.selectedLabel));
    this.labelToPrint = Object.keys(temp).map(key => {
      return {
        type: key,
        value: temp[key]
      };
    });*/
    for (const key of Object.keys(this.selectedLabel)) {
      const obj = { type: this.getValue(key), value: this.selectedLabel[key] };
      if (this.keysToPrint(key)) {
        this.labelToPrint.firstBlock.push(obj);
      }
    }
    this.labelToPrint.firstBlock.push({ type: 'Color', value: '' });
  }

  keysToPrint(key) {
    const valid = ['labelProtected', 'label', 'moduleName', 'organizationName', 'labelTypeName'];
    return valid.indexOf(key) !== -1;
  }

  getValue(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase();
    });
  }

  getMod(idOrg) {
    this.listModOrg = [];
    if (idOrg) {
      this.orgService
        .getModulesByOrg(idOrg)
        .pipe(takeUntil(this.destroy$))
        .subscribe((tz) => {
          this.listModOrg = [{ id: '', name: 'NONE' }, ...tz];
        });
    } else {
      this.listModOrg = [];
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
