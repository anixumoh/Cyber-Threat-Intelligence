import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from 'app/services/store/store';
import { TcxTypes } from 'app/shared/utils/common.utils';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserAccountService } from '../../../dashboard/user/account.service';

@Component({
  selector: 'app-ctx-search',
  templateUrl: './ctx-search.component.html',
  styleUrls: ['./ctx-search.component.scss']
})
export class CtxSearchComponent implements OnInit {
  @ViewChild('search') searchElement: ElementRef;
  @Input() searchText = '';
  @Input() isDisplayingList = true;
  @Input() isShowSyntax = true;
  @Input() tcxType: TcxTypes | '' = '';
  @Input() showSaveSearchButton = false;

  openModalSaveDorks = false;
  searchName = '';
  savedSearchDorks = [];
  savingSearch = false;

  @Output() searchTextChangeEvent = new EventEmitter<String>();
  @Output() searchEvent = new EventEmitter<any>();
  @Output() clearSearchTermEvent = new EventEmitter<any>();
  @Output() openModalDorksEvent = new EventEmitter<any>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected accountService: UserAccountService,
    private store: Store,
    private toastrService: ToastrService
  ) {}

  onSearchTextChangeEvent() {
    this.searchTextChangeEvent.emit(this.searchText);
  }

  onSearchEvent() {
    this.searchEvent.emit();
  }

  onClearSearchTermEvent() {
    this.clearSearchTermEvent.emit();
    setTimeout(() => {
      this.searchElement.nativeElement.focus();
    }, 0);
  }

  onOpenModalDorksEvent() {
    this.openModalDorksEvent.emit(true);
  }

  onOpenModalSaveDorks(value: boolean) {
    this.openModalSaveDorks = value;
    this.searchName = '';
  }

  disabledSaveSearchButton() {
    return this.savedSearchDorks.some((dork) => dork.dork === this.searchText);
  }

  onSaveSearchDorks() {
    this.savingSearch = true;
    if (this.savedSearchDorks.length === 10) {
      this.toastrService.error('You can save only 10 filters', 'Error');
      this.savingSearch = false;
      return;
    }
    if (this.savedSearchDorks.some((dork) => dork.name === this.searchName)) {
      this.savingSearch = false;
      return;
    }

    const dorkToSave = { name: this.searchName, dork: this.searchText, markAsDefault: false };
    this.savedSearchDorks.push(dorkToSave);
    this.accountService.setTcxSaveDorks(this.tcxType, this.savedSearchDorks);
    this.searchName = '';
    this.openModalSaveDorks = false;
    this.savingSearch = false;
  }

  onValidateSaveSearch() {
    return !this.savingSearch && (!/^[A-Za-z\d\s]*$/.test(this.searchName) || this.searchName.length > 50);
  }

  onValidateRepeatNames() {
    return !this.savingSearch && this.savedSearchDorks.some((dork) => dork.name === this.searchName);
  }

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
}
