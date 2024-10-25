import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';

@Component({
  selector: 'app-terms-brand-abuse-new-search-phrase',
  templateUrl: './terms-brand-abuse-new-search-phrase.component.html',
  styleUrls: ['./terms-brand-abuse-new-search-phrase.component.scss']
})
export class TermsBrandAbuseNewSearchPhraseComponent
  extends DetailNewEditAbstractComponent
  implements OnInit, OnDestroy
{
  searchPhrase: string;
  loading = false;
  data: any = {
    values_to_add: []
  };
  settingListTextArea: any = {
    text: '',
    valid: false,
    touched: false,
    error: false
  };

  ngOnInit() {
    const tempArrayObs = [this.organizationService.getCurrentContext, this.loadDataEditMode];

    const tempArrayCb = [
      (context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      },
      (resource) => {
        if (resource) {
          this.resource = resource;
          this.setSubmitData();
          this.initForm();
        }
      }
    ];

    const tempContext = [this.organizationService, this];

    this.setInitContext(tempArrayObs, tempArrayCb, tempContext);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  loadDataEditMode(): Observable<any> {
    if (this.settingId && this.activeModule && this.activeOrganization && this.editMode) {
      return this.settings.getSettingsDataView(this.settingId, this.resourceId);
    } else {
      return of(null);
    }
  }

  setSubmitData() {
    this.data = {
      values_to_add: []
    };
    this.settingListTextArea = {
      text: '',
      valid: false,
      touched: false,
      error: false
    };
  }

  initForm() {
    if (this.editMode) {
      this.setTermsFormEditMode();
    }
  }

  setTermsFormEditMode() {
    if (this.editMode) {
      this.searchPhrase = this.resource.value.searchPhrase;
    }
  }

  isMinLength() {
    return this.settingListTextArea.textt && this.settingListTextArea.text.length < 3;
  }

  onChangeTextArea() {
    this.settingListTextArea.error = false;
    if (this.settingListTextArea.text) {
      this.settingListTextArea.valid = true;
      this.settingListTextArea.touched = true;
    } else {
      this.settingListTextArea.valid = false;
      this.settingListTextArea.touched = true;
    }
    this.settingListTextArea.length = this.settingListTextArea.text.length < 3;
  }

  isTextAreaValid() {
    return this.settingListTextArea.valid;
  }

  isTextAreaTouched() {
    return this.settingListTextArea.touched;
  }

  isTextAreaValidAndTouched() {
    return this.isTextAreaValid() && this.isTextAreaTouched();
  }

  isTextAreaInvalidAndTouched() {
    return !this.isTextAreaValid() && this.isTextAreaTouched();
  }

  isTextListError() {
    return this.settingListTextArea.error;
  }

  updateSubmitDataCreate() {
    this.data.values_to_add = [];
    if (this.settingListTextArea.text) {
      this.settingListTextArea.valid = true;
      this.settingListTextArea.text.split('\n').forEach((searchPhrase) => {
        searchPhrase = searchPhrase.trim();
        this.data.values_to_add.push({ value: searchPhrase });
      });
    } else {
      this.settingListTextArea.valid = false;
    }
  }

  onSubmit() {
    this.loading = true;
    this.settingListTextArea.touched = true;
    this.updateSubmitDataCreate();
    if (this.isTextAreaValidAndTouched()) {
      this.settings
        .saveSettingsDataObs('keyword', this.data)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.loading = false))
        )
        .subscribe(
          () => {
            this.setSubmitData();
            this.router.navigate([
              `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
            ]);
          },
          (err) => {
            if (err?.startsWith?.('412')) {
              this.toastrService.error(`Organization doesn't have a Customer assigned`);
              return;
            }
            this.settingListTextArea.valid = false;
            this.settingListTextArea.error = true;
          }
        );
    }
  }
}
