import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';

import { LabelsService } from '../../../core/models/labels.service';
import { ToastrService } from 'ngx-toastr';
import { Grants } from 'app/services/grants/grants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-label-filter',
  templateUrl: './modal-label-filter.component.html',
  styleUrls: ['./modal-label-filter.component.scss'],
})
export class ModalLabelFilterComponent implements OnDestroy, OnChanges, AfterViewInit {
  _filteredLabels = false;
  isFiltering = true;
  label: any = {};
  labels = [];

  textToSearch = '';
  loading = false;
  defaultDayOld = undefined;

  @ViewChild('content', { static: false }) private modalContent: TemplateRef<any>;

  @Input() defaultDay;
  @Input() open = false;
  @Input() okText = 'Apply Filter';
  @Input() organizationId;
  @Input() moduleId;
  @Input() moduleType;
  @Input() assignedLabels;
  @Input()
  set selectedLabels(its) {
    this._filteredLabels = its;
    if (its === false) {
      this.labels.forEach((label) => {
        label.fxSelected = false;
        label.strict = false;
        label.excluded = false;
      });
    }
  }

  @Output() onClose = new EventEmitter<any>();
  @Output() onFilter = new EventEmitter();

  private readonly destroy$ = new Subject<void>();

  get selectedLabels() {
    return this._filteredLabels;
  }

  constructor(
    private labelsService: LabelsService,
    private toastrService: ToastrService,
    protected grants: Grants,
    private modalService: NgbModal
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.open?.currentValue && (!this.labels.length || this.defaultDayOld !== this.defaultDay )) {
      this.defaultDayOld = this.defaultDay;
      this.labels = [];
      this.getLabels();
    }

    if (changes.open && changes.open.currentValue && this.modalContent) {
      this.modalService.open(this.modalContent, { size: 'md', backdrop: 'static', centered: true });
    }
  }

  ngAfterViewInit(): void {
    if (this.modalContent && this.open) {
      this.modalService.open(this.modalContent, { size: 'md', backdrop: 'static', centered: true });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startAdd() {
    this.isFiltering = false;
    this.label = {};
  }

  startEdit(label) {
    this.isFiltering = false;
    const auxLabel = { ...label, ...{ labelTypeId: `${label.labelTypeId}` } };
    this.label = auxLabel;
  }

  backToList() {
    this.isFiltering = true;
    this.label = {};
  }

  click(label, event) {
    if (event.target.className && event.target.className !== 'checkbox-default') {
      label.fxSelected = !!!label.fxSelected;
    }
  }

  strict(label) {
    label.strict = !!!label.strict;
  }

  updateLabel(label, type) {
    switch (type) {
      case 'and':
        label.strict = true;
        label.excluded = false;
        break;
      case 'or':
        label.strict = false;
        label.excluded = false;
        break;
      case 'not':
        label.strict = false;
        label.excluded = true;
    }
  }

  closeModal() {
    this.onClose.emit();
    this.modalService.dismissAll();
  }

  edit(label, index) {
    label.fxSelected = true;
  }

  filter() {
    const labels = [];
    const labelsAnd = [];
    const excludeLabels = [];
    const labelsToUnassign = [];
    const selectedLabels = [];
    const unselectedLabels = [];
    for (const label of this.labels) {
      if (label.fxSelected && label.strict) {
        labelsAnd.push(label.id);
        selectedLabels.push(label);
      } else if (label.fxSelected && label.excluded) {
        excludeLabels.push(label.id);
        selectedLabels.push(label);
      } else if (label.fxSelected && !label.strict && !label.excluded) {
        labels.push(label.id);
        selectedLabels.push(label);
      } else if (label.isAlreadyAssigned) {
        labelsToUnassign.push(label.id);
        unselectedLabels.push(label);
      } else {
        unselectedLabels.push(label);
      }
    }
    this.labels = [...selectedLabels, ...unselectedLabels];
    this.onFilter.emit({ labels, labelsAnd, excludeLabels, unassignLabels: labelsToUnassign });
    this.modalService.dismissAll();
  }

  getLabels() {
    const moduleLabels = this.okText === 'Assign Labels';
    this.loading = true;
    this.labelsService
      .list(this.organizationId, this.moduleId, this.moduleType, this.defaultDay, moduleLabels)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((list) => {
        if (this.assignedLabels) {
          const selectedLabels = [];
          const unselectedLabels = [];
          for (const item of list) {
            const exist = this.assignedLabels.find((id) => id === item.id);
            if (exist) {
              item.isAlreadyAssigned = true;
              item.fxSelected = true;
              selectedLabels.push(item);
            } else {
              unselectedLabels.push(item);
            }
          }
          list = [...selectedLabels, ...unselectedLabels];
        }
        this.labels = list || [];
      });
  }

  onLabelSave(label) {
    const toSave = { ...label };
    if (toSave.labelTypeId === '1') {
      toSave.organizationId = this.organizationId;
    }
    let request$;
    request$ = this.label.id ? this.labelsService.update(this.label.id, toSave) : this.labelsService.store(toSave);
    this.loading = true;
    request$
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        () => {
          this.backToList();
          setTimeout(() => {
            this.getLabels();
          });
        },
        (error) => {
          let message = `Label data couldn't be saved`;
          if (error && error.status === 409) {
            message = 'Label already exists';
          }
          this.toastrService.error(message, 'Error');
        }
      );
  }

  onLabelDestroy(id) {
    if (id) {
      this.loading = true;
      this.labelsService
        .destroy(id)
        .pipe(
          takeUntil(this.destroy$),
          take(1),
          finalize(() => (this.loading = false))
        )
        .subscribe(
          () => {
            this.backToList();
            setTimeout(() => {
              this.getLabels();
            });
          },
          () => this.toastrService.error(`Label could not be deleted`, 'Error')
        );
    }
  }
}
