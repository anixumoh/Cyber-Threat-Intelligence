import { Component, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-labels-temp',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent {
  isMenuOpened = false;
  _openCreateModal = false;
  _openUpdateModal = false;
  _openListModal = true;
  updateData = false;
  saveData: any;
  labelToUpdate: any;
  filterType = false;
  actionType = false;
  _selectedLabels: any;
  customClass: string;
  labelsLoading = false;

  @ViewChild('modalCard') modalCard: ElementRef;
  @ViewChild('modalButton1') modalButton1: ElementRef;
  @ViewChild('modalButton2') modalButton2: ElementRef;
  @ViewChild('modalButton3') modalButton3: ElementRef;
  @ViewChild('modalButtonNew') modalButtonNew: ElementRef;
  @ViewChild('modalButtonBack') modalButtonBack: ElementRef;

  @Input() labelModalButtons: Array<ElementRef> = [];
  @Input() createInFilter = false;
  @Input() hideButtons = false;
  @Input() isDetails = false;
  @Input()
  set type(t) {
    if (t === 'filter') {
      this.filterType = true;
    } else if (t === 'action') {
      this.actionType = true;
    } else if (t === 'create') {
      this._openCreateModal = true;
    }
  }

  @Input()
  set selectedLabels(labels) {
    this._selectedLabels = labels;
  }

  @Output() updateListEmitter = new EventEmitter();
  @Output() closeModalEmitter = new EventEmitter();
  @Output() createLabelEmitter = new EventEmitter();

  constructor(
    private el: ElementRef,
    private cd: ChangeDetectorRef,
    private labelsService: LabelsService,
    public grants: Grants
  ) {}

  onClickOutside(event) {
    if (
      this.checkModalCard(event.target) &&
      this.checkModalButtons(event.target) &&
      this.checkNewAndUpdateModalButtons(event.target) &&
      !this.checkLabelModalButtonsAndTargetElement(event.target)
    ) {
      this.isMenuOpened = false;
    }
  }

  checkModalCard(target) {
    return this.modalCard && this.modalCard.nativeElement && !this.modalCard.nativeElement.contains(target);
  }

  checkModalButtons(target) {
    return (
      this.modalButton1 &&
      this.modalButton1.nativeElement &&
      !this.modalButton1.nativeElement.contains(target) &&
      this.modalButton2 &&
      this.modalButton2.nativeElement &&
      !this.modalButton2.nativeElement.contains(target) &&
      this.modalButton3 &&
      this.modalButton3.nativeElement &&
      !this.modalButton3.nativeElement.contains(target)
    );
  }

  checkNewAndUpdateModalButtons(target) {
    return (
      this.modalButtonNew &&
      this.modalButtonNew.nativeElement &&
      !this.modalButtonNew.nativeElement.contains(target) &&
      this.modalButtonBack &&
      this.modalButtonBack.nativeElement &&
      !this.modalButtonBack.nativeElement.contains(target)
    );
  }

  checkLabelModalButtonsAndTargetElement(target) {
    return (
      this.labelModalButtons &&
      this.labelModalButtons.length &&
      this.labelModalButtons.findIndex((el: ElementRef) => {
        return el.nativeElement.contains(target);
      }) !== -1
    );
  }

  resetState() {
    this.updateData = false;
    this.saveData = null;
    this.labelToUpdate = undefined;
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.detectChanges();
    }
  }

  toggleMultipleLabels() {
    this.labelsService.toggleMultiple(this._selectedLabels);
  }

  toggleMenu(isAction) {
    this.labelsLoading = true;
    if (isAction === 'action' || this.isDetails) {
      this.actionType = true;
      this.filterType = false;
      this.labelsService.getLabels(false).subscribe(() => {
        this.labelsService.checkSelectedLabels();
        this.labelsLoading = false;
      });
    } else {
      this.labelsService.getLabels(true).subscribe(() => {
        this.toggleMultipleLabels();
        this.labelsLoading = false;
      });
    }

    if (this.createInFilter) {
      this._openCreateModal = true;
    }
    this.isMenuOpened = !this.isMenuOpened;

    this.resetState();
  }

  updateItem(event) {
    this.labelToUpdate = event;
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.detectChanges();
    }
    this.toggleModals('update');
  }

  updateLabel(event) {
    const s = this.labelsService.updateLabel(event).subscribe(() => {
      s.unsubscribe();

      this.labelsService.getLabels(this.filterType).subscribe();
      s.unsubscribe();
      this.toggleModals('list');
      this.resetState();
    });
  }

  update() {
    this.updateData = true;
  }

  saveLabel(event) {
    const s = this.labelsService.createLabel(event).subscribe((r) => {
      s.unsubscribe();
      if (!this.createInFilter) {
        this.toggleModals('list');
        this.resetState();
      } else {
        this.createLabelEmitter.emit(r);
        this.isMenuOpened = false;
      }
    });
  }

  save() {
    this.saveData = {};
  }

  deleteLabel() {
    const s = this.labelsService.deleteLabel(this.labelToUpdate).subscribe(() => {
      this.toggleModals('list');
      this.resetState();
      s.unsubscribe();
    });
  }

  onFilterByLabel() {
    this.labelsService.filterByLabel();
    this.isMenuOpened = !this.isMenuOpened;
  }

  toggleModals(type) {
    if (type === 'list') {
      this._openListModal = true;
      this._openCreateModal = this._openUpdateModal = false;
    } else if (type === 'create') {
      this._openCreateModal = true;
      this._openListModal = this._openUpdateModal = false;
    } else if (type === 'update') {
      this._openUpdateModal = true;
      this._openListModal = this._openCreateModal = false;
    }
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.detectChanges();
    }
  }

  assign() {
    this.labelsService.assignLabels();
    this.isMenuOpened = !this.isMenuOpened;
    this.resetState();
    this.updateListEmitter.emit();
  }

  cancel() {
    this.isMenuOpened = !this.isMenuOpened;
    this.toggleModals('list');
    this.closeModalEmitter.emit();
  }
}
