import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CommonAdmin } from '../../shared/common-admin';
import { OrganizationService } from '../../organization/organization.service';
import { NewEditLabelsComponent } from '../../labels/new-edit-labels/new-edit-labels.component';
import { FiltersService } from '../filters.service';
import { LabelsService } from '../../labels/labels.service';

@Component({
  selector: 'app-new-edit-filters',
  templateUrl: './new-edit-filters.component.html',
  styleUrls: ['./new-edit-filters.component.scss']
})
export class NewEditFiltersComponent extends CommonAdmin implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dynamic', { read: ViewContainerRef }) v;
  @ViewChild('searchFilter') searchFilterRef: ElementRef;
  @Input() organization;
  @Output() onCloseEmit = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  form: UntypedFormGroup;
  view = {} as any;
  viewConditions = [true, true];
  listOrg = [];
  showLabels: any;
  viewSelected: boolean;
  loadInit: boolean;
  loading = false;
  globalLabels = [];
  plugins: any[] = [];
  languages: any[] = [];
  countries: any[] = [];
  labels: any[] = [];
  actionLabels: any[] = [];
  searchOpen = {
    plugins: false,
    languages: false,
    countries: false,
    labels: false,
    actionLabels: false
  };
  listClone: any;
  listWebType = [
    {
      name: 'Blog',
      key: '1',
      selected: false
    },
    {
      name: 'Forum',
      key: '2',
      selected: false
    },
    {
      name: 'Social Network',
      key: '3',
      selected: false
    },
    {
      name: 'Web',
      key: '4',
      selected: false
    },
    {
      name: 'News',
      key: '5',
      selected: false
    },
    {
      name: 'Video',
      key: '6',
      selected: false
    },
    {
      name: 'Others',
      key: '0',
      selected: false
    }
  ];
  ListAnalysisResults = [
    {
      name: 'Not Available',
      key: '0',
      selected: false,
      disabled: false
    },
    {
      name: 'Important',
      key: '6',
      selected: false,
      disabled: false
    },
    {
      name: 'Positive',
      key: '3',
      selected: false,
      disabled: false
    },
    {
      name: 'Negative',
      key: '4',
      selected: false,
      disabled: false
    },
    {
      name: 'Informative',
      key: '5',
      selected: false,
      disabled: false
    },
    {
      name: 'Not Important',
      key: '1',
      selected: false,
      disabled: false
    },
    {
      name: 'Not Processable',
      key: '2',
      selected: false,
      disabled: false
    }
  ];
  analysisResultActionsArray = [
    {
      name: 'Important',
      key: 6,
      selected: false
    },
    {
      name: 'Positive',
      key: 3,
      selected: false
    },
    {
      name: 'Negative',
      key: 4,
      selected: false
    },
    {
      name: 'Informative',
      key: 5,
      selected: false
    },
    {
      name: 'Not Important',
      key: 1,
      selected: false
    }
  ];
  listFileType = [
    {
      name: 'Html',
      key: '0',
      selected: false
    },
    {
      name: 'Image',
      key: '1',
      selected: false
    },
    {
      name: 'Document',
      key: '2',
      selected: false
    },
    {
      name: 'Others',
      key: '3',
      selected: false
    }
  ];

  private _list = {};
  private waitFor = new Subject<string>();
  private waitForQueue: any[] = [];
  private semaphore = true;
  private readonly destroy$ = new Subject<void>();

  get values() {
    return this.form.getRawValue();
  }

  get actions(): any {
    return <UntypedFormArray>this.form.controls['actions'];
  }

  get conditions(): any {
    return <UntypedFormArray>this.form.controls['conditions'];
  }

  get labels_asignation() {
    let retorno = null;
    if (
      !(
        this.values &&
        this.values.actions &&
        this.values.actions.length &&
        this.values.actions.filter((e) => e.type === 'LABEL_ASSIGNATION').length
      )
    ) {
      this.addActions({ type: 'LABEL_ASSIGNATION' });
    }
    for (const controls of this.actions.controls) {
      if (controls.controls['type'].value === 'LABEL_ASSIGNATION') {
        retorno = controls;
      }
    }
    return retorno;
  }

  get labels_condition() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'HAS_LABEL';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({ type: keyModel });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get weight_assignation() {
    let retorno = null;
    if (
      !(
        this.values &&
        this.values.actions &&
        this.values.actions.length &&
        this.values.actions.filter((e) => e.type === 'WEIGHT_ASSIGNATION').length
      )
    ) {
      this.addActions({
        type: 'WEIGHT_ASSIGNATION',
        value: 0
      });
    }
    for (const controls of this.actions.controls) {
      if (controls.controls['type'].value === 'WEIGHT_ASSIGNATION') {
        retorno = controls;
      }
    }
    return retorno;
  }

  get deleteStopFilterExecution() {
    let retorno = null;
    if (
      !(
        this.values &&
        this.values.actions &&
        this.values.actions.length &&
        this.values.actions.filter((e) => e.type === 'DELETE').length
      )
    ) {
      this.addActions({
        type: 'DELETE',
        value: false
      });
    }
    for (const controls of this.actions.controls) {
      if (controls.controls['type'].value === 'DELETE') {
        retorno = controls;
      }
    }
    return retorno;
  }

  get cutExecution() {
    let retorno = null;
    if (
      !(
        this.values &&
        this.values.actions &&
        this.values.actions.length &&
        this.values.actions.filter((e) => e.type === 'CUT_EXECUTION').length
      )
    ) {
      this.addActions({
        type: 'CUT_EXECUTION',
        value: false
      });
    }
    for (const controls of this.actions.controls) {
      if (controls.controls['type'].value === 'CUT_EXECUTION') {
        retorno = controls;
      }
    }
    return retorno;
  }

  get analysys_results_assign() {
    let retorno = null;
    if (
      !(
        this.values &&
        this.values.actions &&
        this.values.actions.length &&
        this.values.actions.filter((e) => e.type === 'ANALYSIS_RESULT_ASSIGNATION').length
      )
    ) {
      this.addActions({
        type: 'ANALYSIS_RESULT_ASSIGNATION',
        value: ''
      });
    }
    for (const controls of this.actions.controls) {
      if (controls.controls['type'].value === 'ANALYSIS_RESULT_ASSIGNATION') {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_analysis_result() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'ANALYSIS_RESULT';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({ type: keyModel });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_FileType() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'FILE_TYPE';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({ type: keyModel });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_filter_phrase() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'FILTER_PHRASE';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        value: '',
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_domain() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'DOMAIN';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        value: '',
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_origins() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'ORIGIN';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_extradata_entry() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'EXTRADATA_ENTRY';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        if (!controls.controls['key']) {
          controls.addControl(
            'value',
            this.fb.group({
              key: [''],
              value: ['']
            })
          );
        }
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_languages() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'LANGUAGE';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  get condition_country() {
    const arrayModel = this.values.conditions || [];
    const keyModel = 'COUNTRY';
    let retorno = null;
    if (!arrayModel.filter((e) => e.type === keyModel).length) {
      this.addCondisions({
        type: keyModel,
        inverse: false
      });
    }
    for (const controls of this.conditions.controls) {
      if (controls.controls['type'].value === keyModel) {
        retorno = controls;
      }
    }
    return retorno;
  }

  constructor(
    protected fb: UntypedFormBuilder,
    protected labelService: LabelsService,
    protected orgService: OrganizationService,
    protected filterServ: FiltersService,
    protected fr: ComponentFactoryResolver,
    protected toastrService: ToastrService,
    protected cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnChanges(): void {
    if (this.organization && this.values.superSearchId !== this.organization) {
      this.form.controls['superSearchId'].setValue(this.organization);
    }
  }

  ngOnInit() {
    this.instanceForm();
    this.getOrganizations();
    this.getList();
    this.setWaitFor();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  list(key) {
    return this._list[key] || [];
  }

  getLabels(id) {
    const key = 'labels';
    const assignKey = 'actionLabels';
    if (id) {
      this.labelService
        .getOrgLabels(id, false)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this._list[key] = res;
          this._list[assignKey] = res;
        });
    }
  }

  getList() {
    this.filterServ
      .listOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (e: any) => {
          this.nextWaitFor(() => {
            const actionLabels = JSON.parse(JSON.stringify(e.labels));
            this._list = { ...this._list, ...e, actionLabels };
            this.globalLabels = e.labels;
            this.plugins = this.list('plugins');
            this.languages = this.list('languages');
            this.countries = this.list('countries');
            this.labels = this.list('labels');
            this.actionLabels = this.list('actionLabels');
          });
        },
        (error) => {
          this.toastrService.error(error, 'Error');
        }
      );
  }

  closeModal() {
    this.onCloseEmit.emit(null);
  }

  instanceForm(data = null) {
    const nameRegex = new RegExp(/^(?!\*|\?).*/);

    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      name: [data && data.name ? data.name : '', [Validators.required, Validators.pattern(nameRegex)]],
      inUse: [data && data.inUse ? data.inUse : false],
      superSearchId: [data && data.superSearchId ? data.superSearchId : ''],
      actions: this.fb.array([]),
      conditions: this.fb.array([])
    });

    if (data && data.conditions && data.conditions) {
      for (const a of data.conditions) {
        this.addCondisions(a);
      }
    }
    if (data && data.actions && data.actions) {
      for (const a of data.actions) {
        this.addActions(a);
      }
    }
    this.isNew = !(data && data.id);

    if (!this.isNew && !this.loadInit) {
      this.loadInit = true;
      this.getFilter(data.id);
    }

    this.form
      .get('superSearchId')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (this.labels_asignation.controls['value']) {
          this.labels_asignation.setControl('value', this.fb.array([])); // here, `fb` is a form builder instance
        }

        if (this.labels_condition.controls['value']) {
          this.labels_condition.setControl('value', this.fb.array([])); // here, `fb` is a form builder instance
        }

        if (val) {
          this.getLabels(val);
        } else {
          this._list['labels'] = this.globalLabels;
        }
      });
  }

  addActions(a = null) {
    this.actions.push(this.instanceActions(a));
  }

  addCondisions(a = null) {
    this.conditions.push(this.instanceActions(a));
  }

  instanceActions(data) {
    if (data.type === 'ANALYSIS_RESULT_ASSIGNATION' && !data.value) {
      data.value = '';
    } else if (data.type === 'ANALYSIS_RESULT_ASSIGNATION' && data.value) {
      this.assignResultType(data.value);
    }
    const form = this.fb.group({});
    for (const key of Object.keys(data)) {
      this.addControl(form, data[key], key);
    }
    return form;
  }

  addControl(form: any, value, key = null) {
    if (Array.isArray(value) || typeof value === 'object') {
      if (key) {
        if (!form.controls[key] && Array.isArray(value)) {
          form.addControl(key, this.fb.array([]));
        } else if (!form.controls[key] && typeof value === 'object') {
          form.addControl(key, this.fb.group({}));
        } else {
          form.addControl(key, new UntypedFormControl());
        }
        form = form.controls[key];
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'object') {
            form.push(new UntypedFormControl(item));
          } else if (!Array.isArray(item)) {
            const group = this.fb.group({});
            for (const itemKey of Object.keys(item)) {
              this.addControl(group, item[itemKey], itemKey);
            }
            form.push(group);
          } else {
            let tform: any;
            for (const key_item in item) {
              if (typeof item[key_item] !== 'object') {
                tform = new UntypedFormControl(item[key_item]);
              } else if (Array.isArray(item[key_item])) {
                tform = this.fb.array([]);
                this.addControl(tform, item[key_item]);
                form.push(tform);
              } else {
                const group = this.fb.group({});
                this.addControl(group, item[key_item]);
                form.push(group);
              }
            }
            form.push(tform);
          }
        }
      } else {
        for (const itemKey of Object.keys(value)) {
          this.addControl(form, value[itemKey], itemKey);
        }
      }
    } else if (key) {
      form.addControl(key, new UntypedFormControl(value));
    } else {
      form.addControl(new UntypedFormControl(value));
    }
  }

  togleBool(state) {
    this.viewConditions[state] = !this.viewConditions[state];
  }

  resetOrganization() {
    this.form.controls.superSearchId.setValue('');
  }

  getOrganizations() {
    this.orgService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => (this.listOrg = a));
  }

  addLabels(item) {
    if (!this.labels_asignation.controls['value']) {
      this.labels_asignation.addControl('value', this.fb.array([]));
    }
    this.labels_asignation.controls['value'].push(new UntypedFormControl(item.id));
  }

  assignResultType(type) {
    let id = type.key;
    this.analysisResultActionsArray.forEach((element) => {
      if (type === element.key) {
        element.selected = true;
      } else if (type.key !== element.key) {
        element.selected = false;
      } else if (
        type.key.toString() === this.analysys_results_assign.value.value.toString() &&
        element.key.toString() === this.analysys_results_assign.value.value.toString()
      ) {
        id = '';
        element.selected = false;
      } else {
        element.selected = true;
      }
    });
    this.analysys_results_assign.controls.value.patchValue(id);
  }

  removeLabels(item) {
    const value = this.labels_asignation.controls['value'].value;
    const index = value.findIndex((e) => Number(e) === Number(item.id));
    if (index !== -1) {
      this.labels_asignation.controls['value'].removeAt(index);
    }
  }

  newLabel() {
    this.showLabels = false;
    this.v.clear();
    const resolver = this.fr.resolveComponentFactory(NewEditLabelsComponent);
    const ref: any = this.v.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showLabels = true;
      this.v.clear();
    });
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showLabels = true;
      this.v.clear();
      this.getList();
    });

    const idOrg = this.values.superSearchId;
    if (idOrg) {
      ref.instance.form.controls['organizationId'].setValue(idOrg);
      ref.instance.form.controls['organizationId'].disable();
    }
  }

  add_contitions_analysisR(type) {
    if (this.indexAnalysisR(type) === -1) {
      this.condition_analysis_result.controls['value'].push(new UntypedFormControl(type));
    } else {
      this.remove_contitions_analysisR(type);
    }
    this.isImportantCondition(type);
  }

  isImportantCondition(type) {
    if (type.toString() === '6') {
      this.ListAnalysisResults[2].selected = !this.ListAnalysisResults[2].selected;
      this.ListAnalysisResults[2].disabled = !this.ListAnalysisResults[2].disabled;

      this.ListAnalysisResults[3].selected = !this.ListAnalysisResults[3].selected;
      this.ListAnalysisResults[3].disabled = !this.ListAnalysisResults[3].disabled;

      this.ListAnalysisResults[4].selected = !this.ListAnalysisResults[4].selected;
      this.ListAnalysisResults[4].disabled = !this.ListAnalysisResults[4].disabled;
    }
  }

  indexAnalysisR(item) {
    if (!this.condition_analysis_result.controls['value']) {
      this.condition_analysis_result.addControl('value', this.fb.array([]));
    }
    const values = this.condition_analysis_result.controls['value'].value;
    const index = values.indexOf(item);
    return index;
  }

  remove_contitions_analysisR(type) {
    if (this.indexAnalysisR(type) !== -1) {
      this.condition_analysis_result.controls['value'].removeAt(this.indexAnalysisR(type));
    }
  }

  add_contitions_FileType(type) {
    if (this.indexFileType(type) === -1) {
      this.condition_FileType.controls['value'].push(new UntypedFormControl(type));
    } else {
      this.remove_contitions_FileType(type);
    }
  }

  indexFileType(item) {
    if (!this.condition_FileType.controls['value']) {
      this.condition_FileType.addControl('value', this.fb.array([]));
    }
    const values = this.condition_FileType.controls['value'].value;
    const index = values.indexOf(item);
    return index;
  }

  remove_contitions_FileType(type) {
    if (this.indexFileType(type) !== -1) {
      this.condition_FileType.controls['value'].removeAt(this.indexFileType(type));
    }
  }

  enableAddLabel(item) {
    const value = this.labels_asignation.value.value;
    const retorno = !(value && value.length && value.indexOf(item.id) !== -1);
    return retorno;
  }

  labelId(index) {
    const value = this.labels_asignation.value.value;
    let retorno = this.list('labels').filter((e) => e.id === value[index])[0];
    if (!retorno) {
      retorno = this.list('labels').filter((e) => e.id === value[index])[0];
      if (retorno) {
        retorno.bgColorHex = retorno.bgColorRGB;
        retorno.textColorHex = retorno.textColorRGB;
      }
    }
    return retorno || <any>{};
  }

  getFilter(id) {
    this.filterServ
      .getFilterId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          a.actions.map((e) => {
            const obj = e;
            if (obj.value) {
              obj.value = JSON.parse(e.value);
            }
            return obj;
          });

          a.conditions.map((e) => {
            const obj = e;
            if (obj.value) {
              if (e.type === 'FILTER_PHRASE' || e.type === 'DOMAIN') {
                obj.value = obj.value.join(' ');
              } else if (e.type === 'EXTRADATA_ENTRY') {
                obj.value = e.value[0] !== '{}' ? JSON.parse(e.value) : { key: '', value: '' };
              }
            }
            return obj;
          });
          this.instanceForm(a);
        },
        (error) => {
          this.toastrService.error(error, 'Error');
        }
      );
  }

  createEdit() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const obj = this.removeEmpty(this.values);

    obj.conditions.map((cond) => {
      if (cond.value && typeof cond.value === 'object' && !Array.isArray(cond.value)) {
        cond.value = JSON.stringify(cond.value);
      }
      if (cond.value && !Array.isArray(cond.value)) {
        cond.value = cond.value.split();
      }
      if (cond.value && cond.value.length) {
        cond.value = cond.value.map((e) => e.toString());
      }

      return cond;
    });

    obj.conditions.map((cond) => {
      if (cond.type === 'HAS_LABEL') {
        cond.inverse = false;
      }
      return cond;
    });

    obj.actions.map((cond) => {
      if (cond.type === 'LABEL_ASSIGNATION') {
        cond.value = JSON.stringify(cond.value);
        // cond.value = cond.value.map(String);
      }
      return cond;
    });

    const someCondition = obj.conditions.some((c) => c.value);
    const someAction = obj.actions.some((c) => c.value);
    if (!someCondition || !someAction) {
      this.toastrService.error('You should select at least one condition and one action', 'Error');
      return;
    }

    this.isNew ? this.create(obj) : this.edit(obj);
  }

  create(obj) {
    this.loading = true;
    this.filterServ
      .create(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => {
          this.onSuccess.emit(tz);
          this.loading = false;
        },
        (error) => {
          this.toastrService.error(error, 'Error');
          this.loading = false;
        }
      );
  }

  edit(obj) {
    this.loading = true;
    this.filterServ
      .edit(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => {
          this.onSuccess.emit(tz);
          this.loading = false;
        },
        (error) => {
          this.toastrService.error(error, 'Error');
          this.loading = false;
        }
      );
  }

  searchInFilters(event: any, list: string): void {
    const word = event.target ? event.target.value.toLowerCase() : event;
    if (word.length > 0) {
      this._list[list].forEach((el) => {
        if (el.label ? el.label?.toLowerCase().indexOf(word) < 0 : el.value?.toLowerCase().indexOf(word) < 0) {
          el.hidden = true;
        } else {
          el.hidden = false;
        }
      });
    } else {
      this._list[list].forEach((el) => {
        el.hidden = false;
      });
    }
  }

  closeSearch(type) {
    this.searchOpen[type] = !this.searchOpen[type];

    if (!this.searchOpen[type]) {
      this.searchInFilters('', type);
    }
  }

  private setWaitFor() {
    this.waitFor.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.semaphore && this.waitForQueue.length) {
        this.semaphore = false;
        const task = this.waitForQueue.shift();
        task();
      }
    });
  }

  private nextWaitFor(callback) {
    this.waitForQueue.push(() => {
      if (callback) {
        callback();
      }
      this.semaphore = true;
      this.waitFor.next();
    });
    this.waitFor.next();
  }
}
