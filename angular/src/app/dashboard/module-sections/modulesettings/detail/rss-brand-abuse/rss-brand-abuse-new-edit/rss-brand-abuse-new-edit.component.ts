import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { of as observableOf, forkJoin as observableForkJoin, Observable } from 'rxjs';
import { finalize, first, takeUntil } from 'rxjs/operators';

import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';

@Component({
  selector: 'app-rss-brand-abuse-new-edit',
  templateUrl: './rss-brand-abuse-new-edit.component.html',
  styleUrls: ['./rss-brand-abuse-new-edit.component.scss']
})
export class RssBrandAbuseNewEditComponent extends DetailNewEditAbstractComponent implements OnInit, OnDestroy {
  rssAvailableTypes: any[] = [];
  regexPrefix = new RegExp(/^((http|https|ftp):\/\/)/);
  regexDomain = new RegExp(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g);

  get name() {
    return this.termsForm.get('name');
  }

  get url() {
    return this.termsForm.get('url');
  }

  ngOnInit() {
    const tempArrayObs = [this.organizationService.getCurrentContext, this.loadData];

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

  loadData(): Observable<any> {
    if (this.settingId && this.activeModule && this.activeOrganization) {
      if (!this.editMode) {
        return this.settings.getAvailableRssType(this.settingId);
      } else {
        return observableForkJoin([
          this.settings.getSettingsDataView(this.settingId, this.resourceId),
          this.settings.getAvailableRssType(this.settingId)
        ]);
      }
    } else {
      return observableOf(null);
    }
  }

  setSubmitData() {
    this.submitData = {
      name: '',
      url: '',
      rssFeedTypeId: 0
    };
  }

  initForm() {
    const name = '';
    const url = '';
    const rssFeedTypeId = 0;
    this.setTermsForm(name, url, rssFeedTypeId);
    this.updateSubmitData();
  }

  updateSubmitData() {
    this.submitData.name = this.termsForm.value.name.trim();
    this.submitData.url = this.termsForm.value.url.trim();
    this.submitData.rssFeedTypeId = +this.termsForm.value.rssFeedTypeId;
  }

  setTermsForm(name, url, rssFeedTypeId) {
    if (this.editMode) {
      name = this.resource[0].name;
      url = this.resource[0].url;
      rssFeedTypeId = this.resource[0].rssFeedTypeId;
      this.rssAvailableTypes = [...this.resource[1]];
    } else {
      url = '';
      this.rssAvailableTypes = [...this.resource];
    }
    this.termsForm = new UntypedFormGroup({
      name: new UntypedFormControl({ value: name, disabled: this.isLoading }, [Validators.required]),
      url: new UntypedFormControl({ value: url, disabled: this.isLoading }, [
        Validators.required,
        this.invalidUrls.bind(this)
      ]),
      rssFeedTypeId: new UntypedFormControl({ value: rssFeedTypeId, disabled: this.isLoading }, [
        Validators.required,
        this.invalidRssType.bind(this)
      ])
    });
  }

  navigateToSettingsList() {
    this.router
      .navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
      ])
      .then();
  }

  onSubmit() {
    this.updateSubmitData();
    this.isLoading = true;
    const settings$ = this.editMode
      ? this.settings.saveSettingsPatchByModule(this.settingId, this.resourceId, this.submitData, 'rss')
      : this.settings.saveSettingsDataRssObs(this.settingId, this.submitData);
    settings$
      .pipe(
        takeUntil(this.destroy$),
        first(),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(() => this.navigateToSettingsList());
  }

  invalidUrls(control: UntypedFormControl): { [s: string]: boolean } {
    if (this.termsForm && control.value && !control.value.match(this.regexPrefix)) {
      return { prefixInvalid: true };
    } else if (this.termsForm && control.value && !control.value.match(this.regexDomain)) {
      return { urlInvalid: true };
    } else {
      return null;
    }
  }

  invalidRssType(control: UntypedFormControl): { [s: string]: boolean } {
    if (this.termsForm && control.value === 0) {
      return { rssTypeInvalid: true };
    }
    return null;
  }
}
