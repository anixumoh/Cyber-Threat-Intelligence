import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { forkJoin as observableForkJoin, of as observableOf, Observable, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';

@Component({
  selector: 'app-terms-brand-abuse-new-edit-image',
  templateUrl: './terms-brand-abuse-new-edit-image.component.html',
  styleUrls: ['./terms-brand-abuse-new-edit-image.component.scss']
})
export class TermsBrandAbuseNewEditImageComponent extends DetailNewEditAbstractComponent implements OnInit, OnDestroy {
  showListImageHelp = false;
  searchPhraseSubmit: string;
  imageFile: any;
  showImageHelp = false;
  previousImageFile = false;
  downloadedImage: any;
  filesStatus: any = [];
  loading = false;
  imageSearchPhraseValid: any = {
    touched: false
  };

  imageValidation: any = {
    valid: false,
    touched: false
  };

  imageListValidation: any = {
    valid: false,
    touched: false,
    limit: 4
  };

  imagesToAdd: any = [];

  get searchPhrase() {
    return this.termsForm.get('searchPhrase');
  }

  ngOnInit() {
    const tempArrayObs = [this.organizationService.getCurrentContext, this.loadData, this.loadImage];

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
      },
      (imageFile) => {
        if (imageFile) {
          this.imageFile = imageFile;
          this.previousImageFile = true;
          const imageType = imageFile.type;
          const reader = new FileReader();
          reader.readAsBinaryString(imageFile);
          reader.onload = () => {
            this.downloadedImage = this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:${imageType};base64,${btoa(reader.result as string)}`
            );
          };
        }
      }
    ];

    const tempContext = [this.organizationService, this, this];

    this.setInitContext(tempArrayObs, tempArrayCb, tempContext);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  loadData(): Observable<any> {
    if (this.settingId && this.activeModule && this.activeOrganization && this.editMode) {
      return this.settings.getSettingsDataView(this.settingId, this.resourceId);
    } else {
      return observableOf({});
    }
  }

  loadImage(): Observable<any> {
    if (this.settingId && this.resourceId && this.activeModule && this.activeOrganization) {
      if (this.editMode && this.resource.searchImageFilename) {
        return this.settings.getSettingsDataViewImage(this.resourceId);
      } else {
        return observableOf(null);
      }
    } else {
      return observableOf(null);
    }
  }

  setSubmitData() {
    if (!this.editMode) {
      this.searchPhraseSubmit = '';
    }
  }

  initForm(cb = null) {
    const searchPhrase = '';
    this.setTermsForm(searchPhrase);
    this.updateSubmitData();
    if (cb) {
      cb.call();
    }
  }

  uploadFile(filesArg) {
    this.imageValidation.touched = true;
    const files = Array.prototype.slice.call(filesArg); // Files to Array
    const getFileId = (file) => `${file.name}:${file.lastModified}:${file.size}`;
    this.filesStatus = [...files.map((f) => ({ name: f.name, id: getFileId(f) }))];
    this.imageFile = files[0];
    this.previousImageFile = true;
    const imageType = this.imageFile.type;
    const reader = new FileReader();
    reader.readAsBinaryString(this.imageFile);
    reader.onload = () => {
      this.downloadedImage = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:${imageType};base64,${btoa(reader.result as string)}`
      );
      this.imageValidation.valid = true;
    };
    this.onSubmitImageEditMode();
  }

  deleteFile() {
    this.initImage();
    this.onDeleteImageEditMode();
  }

  updateSubmitData() {
    if (!this.editMode) {
      this.searchPhraseSubmit = this.termsForm.value.searchPhrase.trim();
    }
  }

  setTermsForm(searchPhrase) {
    if (this.editMode) {
      searchPhrase = this.resource.searchPhrase;
    }

    this.termsForm = new UntypedFormGroup({
      searchPhrase: new UntypedFormControl({ value: searchPhrase, disabled: this.editMode }, [
        Validators.required,
        Validators.pattern('[^]{3,70}')
      ])
    });
  }

  onSubmitImageEditMode() {
    if (this.editMode) {
      if (this.imageFile) {
        this.settings
          .saveSettingsImageMultipartPut(this.resourceId, this.imageFile)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {});
      } else if (this.previousImageFile) {
        this.settings
          .deleteSettingsImage(this.resourceId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.previousImageFile = false;
          });
      }
    }
  }

  onDeleteImageEditMode() {
    if (this.editMode && this.previousImageFile) {
      this.settings
        .deleteSettingsImage(this.resourceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.previousImageFile = false;
        });
    }
  }

  onSubmit() {
    this.loading = true;
    this.updateSubmitData();
    if (this.isImageListValid()) {
      this.multipleImageCreation();
    } else {
      this.loading = false;
      this.imageListValidation.touched = true;
    }
  }

  multipleImageCreation() {
    let requests$: Observable<any>[] = [];

    requests$ = this.imagesToAdd.map((el) => {
      return this.settings.saveSettingsImageMultipart(this.resourceId, el.searchPhrase, el.image);
    });

    forkJoin(requests$)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        () => {
          this.router.navigate([
            `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
          ]);
        },
        (e) => {
          this.toastrService.error(e.body, 'Error');
        }
      );
  }

  onChangeImageHelp() {
    this.showImageHelp = !this.showImageHelp;
  }

  isimageValid() {
    return this.imageValidation.valid;
  }

  isImageTouched() {
    return this.imageValidation.touched;
  }

  isImageInvalidAndTouched() {
    return !this.isimageValid() && this.isImageTouched();
  }

  addImageToList() {
    this.updateSubmitData();
    if (this.isimageValid() && this.termsForm.valid && this.isImageListinLimit()) {
      this.imagesToAdd.push({ searchPhrase: this.searchPhraseSubmit, image: this.imageFile });
      this.initForm();
      this.initImage(() => {
        this.imageListValidation.valid = true;
        this.imageValidation.touched = false;
        this.imageSearchPhraseValid.touched = false;
      });
    } else {
      this.imageSearchPhraseValid.touched = true;
      this.imageValidation.touched = true;
    }
  }

  updateImageInlist(event, index) {
    this.imagesToAdd[index].searchPhrase = event.target.value;
  }

  deleteImageFromList(index) {
    this.imagesToAdd.splice(index, 1);
  }

  isImageListValid() {
    this.imageListValidation.valid = !!this.imagesToAdd.length;
    return this.imageListValidation.valid;
  }

  isImageListTouched() {
    return this.imageListValidation.touched;
  }

  isImageListInvalidAndTouched() {
    return !this.isImageListValid() && this.isImageListTouched();
  }

  imageListLimit() {
    return this.imageListValidation.limit;
  }

  isImageListinLimit() {
    return this.imagesToAdd.length + 1 <= this.imageListValidation.limit;
  }

  initImage(cb = null) {
    this.imageFile = null;
    this.downloadedImage = null;
    this.filesStatus = [];
    this.imageValidation.valid = false;
    if (cb) {
      cb();
    }
  }

  onChangeListImageHelp() {
    this.showListImageHelp = !this.showListImageHelp;
  }
}
