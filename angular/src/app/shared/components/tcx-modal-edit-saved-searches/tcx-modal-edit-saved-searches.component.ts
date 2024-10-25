import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { Store } from 'app/services/store/store';
import { TcxTypes } from 'app/shared/utils/common.utils';
import { remove } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tcx-modal-edit-saved-searches',
  templateUrl: './tcx-modal-edit-saved-searches.component.html'
})
export class TcxModalEditSavedSearchesComponent implements OnInit {
  @Input() openModal = false;
  @Input() tcxType: TcxTypes | '' = '';
  @Output() emitOpenModal = new EventEmitter();

  private readonly destroy$ = new Subject<void>();

  savedSearchDorks = [];

  constructor(protected accountService: UserAccountService, private store: Store) {}

  ngOnInit(): void {
    this.store
      .select('userStateList')
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        const saved =
          response?.modules?.[this.accountService.orgId]?.[this.accountService.modId]?.tcxSearchSaved[this.tcxType];
        this.savedSearchDorks = saved ? saved : [];
      });
  }

  onOpenModal(isOpen: boolean) {
    this.emitOpenModal.emit(isOpen);
  }

  onDeleteSavedFilter(name: string) {
    remove(this.savedSearchDorks, (n) => n.name === name);
    this.accountService.setTcxSaveDorks(this.tcxType, this.savedSearchDorks);
  }

  onMarkAsDefaultSavedFilter(name: string) {
    this.savedSearchDorks = this.savedSearchDorks.map((saved) => ({
      ...saved,
      markAsDefault: saved.name === name && !saved.markAsDefault
    }));
    this.accountService.setTcxSaveDorks(this.tcxType, this.savedSearchDorks);
  }
}
