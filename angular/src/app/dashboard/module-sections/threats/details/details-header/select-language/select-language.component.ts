import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectLanguageService } from 'app/dashboard/module-sections/threats/details/details-header/select-language/select-language.service';
import { getIdFromLanguage } from 'app/utils/functions';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss'],
})
export class SelectLanguageComponent implements OnInit {
  @Input()
  set resource(its) {
    this._resource = its;
    if (
      this._resource &&
      this._resource.id != this.oldResourceId &&
      this._resource.language_id &&
      this.all_languages &&
      this.all_languages.length
    ) {
      this.oldResourceId = this._resource.id;
      this.languageSelected.language = this.resource.language_id;
      this.all_languages = this.setSelectedLanguage(this.all_languages);
    }
  }
  @Input() activeSetLanguage = true;
  @Output() selectLanguageEmit = new EventEmitter();

  all_languages: any[] = [];
  languageSelected: any = {};
  _resource;
  oldResourceId;
  private readonly destroy$ = new Subject<void>();

  get resource() {
    return this._resource;
  }

  constructor(private selectLanguageService: SelectLanguageService, public grants: Grants) {}

  ngOnInit() {
    this.languageSelected.language = this.resource.language_id;
    this.oldResourceId = this.resource.id;

    this.selectLanguageService
      .getlanguagesList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((globalLanguages) => {
        this.languageSelected.language_id = getIdFromLanguage(this.resource.language_id, globalLanguages);
        this.all_languages = this.setSelectedLanguage(globalLanguages);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setSelectedLanguage(globalLanguages) {
    return globalLanguages.map((language) => {
      language.label = language.language;
      if (language.language_id === this.languageSelected.language_id) {
        language.selected = true;
      } else {
        language.selected = false;
      }
      return language;
    });
  }

  selectLanguage(globalLanguages) {
    this.languageSelected = globalLanguages.find((language) => {
      return language.selected;
    });
    if (this.activeSetLanguage) {
      // if requesting from Report from Issue
      this.selectLanguageEmit.emit({ loading: true });
      this.selectLanguageService
        .sendChangeLanguage(this.resource.id, this.languageSelected.language_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.selectLanguageEmit.emit({ loading: false, language: this.languageSelected });
        });
    }
  }
}
