import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormArray, Validators } from '@angular/forms';
import { of as observableOf, Observable, forkJoin } from 'rxjs';
import { finalize, delay, switchMap, takeUntil } from 'rxjs/operators';

import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';

@Component({
  selector: 'app-terms-custom-new-edit',
  templateUrl: './terms-custom-new-edit.component.html',
  styleUrls: ['./terms-custom-new-edit.component.scss']
})
export class TermsCustomNewEditComponent extends DetailNewEditAbstractComponent implements OnInit, OnDestroy {
  imageFile: any;
  showImageHelp = false;
  previousImageFile = false;
  downloadedImage: any;
  filesStatus: any = [];
  loading = false;
  isShowInfo = false;
  isModalInfoOpen = false;
  tableHeader =
    this.grants.isMaster() || this.grants.isSuperAdmin()
      ? ['Crawler', 'Enable', 'Analysis Scheduling Expression']
      : ['Crawler', 'Enable'];
  plugins;
  unavailableTransformadas = [];
  openSearchPhraseInfo = false;

  get transformadasList() {
    if (this.termsForm.get('transformadasList')) {
      return (this.termsForm.get('transformadasList') as UntypedFormArray).controls;
    } else {
      return [];
    }
  }

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
    if (this.settingId && this.activeModule && this.activeOrganization) {
      if (!this.editMode) {
        return this.settings.getAvailableCrawlers(this.settingId);
      } else {
        return this.settings.getSettingsDataView(this.settingId, this.resourceId);
      }
    } else {
      return observableOf(null);
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
      this.submitData = {
        searchEngines: false,
        searchTwitter: false,
        searchFacebook: false,
        crawler: true,
        searchPhrase: '',
        configured: [],
        strict: false,
        type: 'KEYWORD'
      };
    } else {
      this.submitData = {
        searchEngines: false,
        searchTwitter: false,
        searchFacebook: false,
        crawler: true,
        configured: [],
        strict: false
      };
    }
  }

  returnToList() {
    this.toastrService.error('User does not have permissions');
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/terms`
    ]);
  }

  initForm() {
    const searchPhrase = '';
    const searchEngines = false;
    const searchTwitter = false;
    const searchFacebook = false;
    const transformadasList = new UntypedFormArray([]);
    this.settings
      .getAvailableCrawlers(this.settingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (!res) {
            this.returnToList();
          }

          this.plugins = res;
          this.setTermsForm(searchPhrase, searchEngines, searchTwitter, searchFacebook, transformadasList);
          this.updateSubmitData();
        },
        (error: any) => {
          if (error.status === 403) {
            this.returnToList();
          }
        }
      );
  }

  setStatus(status, index) {
    this.termsForm.value.transformadasList[index].enabledTransformada = status;
  }

  updateSchedExpression(event, index) {
    this.termsForm.value.transformadasList[index].visionSchedExpression = event.target.value;
  }

  isConfigured(transformada) {
    return this.editMode
      ? this.resource.configured.find((activeElement) => {
          return activeElement.pluginId === transformada.name && activeElement.enabled;
        })
      : false;
  }

  getAnalysis(transformada) {
    const index = this.resource.configured.findIndex((x) => x.pluginId === transformada.name);
    if (index > -1) {
      return this.resource.configured[index].visionSchedExpression;
    } else {
      return transformada.visionSchedExpression;
    }
  }

  uploadFile(filesArg) {
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
    };
  }

  cleanFileData() {
    this.imageFile = null;
    this.downloadedImage = null;
    this.filesStatus = [];
  }

  deleteFile() {
    this.cleanFileData();
    this.onDeleteImageEditMode();
  }

  get searchPhraseData() {
    if (this.editMode) {
      return this.termsForm?.value?.searchPhrase;
    } else {
      const finishArray = [];
      this.termsForm?.value?.searchPhrase?.split?.('\n').forEach((item) => {
        item = item.trim();
        item.length && finishArray.push(item);
      });

      if (!finishArray || finishArray.length > 1) {
        this.cleanFileData();
      }

      return finishArray;
    }
  }

  get validateSearchPhraseData() {
    if (this.editMode) {
      return this.termsForm?.value?.searchPhrase?.match?.(/[^]{3,80}/);
    } else {
      return this.termsForm?.value?.searchPhrase?.split?.('\n').some((item) => {
        item = item.trim();
        return item && !item.match(/[^]{3,80}/);
      });
    }
  }

  get isDisabledImageLoad() {
    if (!this.editMode) {
      return !this.searchPhraseData?.length || this.searchPhraseData?.length > 1;
    }
    return false;
  }

  updateSubmitData() {
    if (!this.editMode) {
      this.submitData.searchPhrase = this.searchPhraseData;
    }
    this.submitData.searchEngines = this.termsForm.value.searchEngines;
    this.submitData.searchFacebook = this.termsForm.value.searchFacebook;
    this.submitData.searchTwitter = this.termsForm.value.searchTwitter;
    this.submitData.configured = this.termsForm.value.transformadasList.filter((transformada) => {
      return transformada.enabledTransformada;
    });
    this.submitData.configured = this.submitData.configured.map((transformada) => {
      return {
        pluginId: transformada.transformadaName,
        visionSchedExpression: transformada.visionSchedExpression,
        enabled: true
      };
    });
  }

  setTermsForm(searchPhrase, searchEngines, searchTwitter, searchFacebook, transformadasList) {
    if (this.editMode) {
      searchPhrase = this.resource.searchPhrase;
      searchEngines = this.resource.searchEngines;
      searchTwitter = this.resource.searchTwitter;
      searchFacebook = this.resource.searchFacebook;
    }

    if (this.activeModule.moduleName.toLowerCase() === 'custom') {
      this.settings
        .getCustomModulePlugins()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          const available = res;
          (this.editMode ? this.plugins : this.resource).forEach((transformada) => {
            if (available.indexOf(transformada.name) > -1) {
              transformadasList.push(
                new UntypedFormGroup({
                  transformadaName: new UntypedFormControl(transformada.name),
                  enabledTransformada: new UntypedFormControl(
                    this.isConfigured.call(this, transformada) ? true : false
                  ),
                  visionSchedExpression: new UntypedFormControl(
                    this.editMode ? this.getAnalysis.call(this, transformada) : transformada.visionSchedExpression
                  )
                })
              );
            } else {
              this.unavailableTransformadas.push(transformada.name);
            }
          });
        });
    } else {
      (this.editMode ? this.plugins : this.resource).forEach((transformada) => {
        transformadasList.push(
          new UntypedFormGroup({
            transformadaName: new UntypedFormControl(transformada.name),
            enabledTransformada: new UntypedFormControl(this.isConfigured.call(this, transformada) ? true : false),
            visionSchedExpression: new UntypedFormControl(
              this.editMode ? this.getAnalysis.call(this, transformada) : transformada.visionSchedExpression
            )
          })
        );
      });
    }

    this.termsForm = new UntypedFormGroup({
      searchPhrase: new UntypedFormControl({ value: searchPhrase, disabled: this.editMode }, [
        Validators.required,
        Validators.pattern('[^]{3,80}')
      ]),
      searchEngines: new UntypedFormControl(searchEngines),
      searchTwitter: new UntypedFormControl(searchTwitter),
      searchFacebook: new UntypedFormControl(searchFacebook),
      transformadasList
    });
  }

  onSubmit() {
    this.loading = true;
    this.updateSubmitData();

    const requests$: Observable<any>[] = [];

    requests$.push(this.settings.saveSettingsDataMultipart(this.settingId, this.submitData, this.imageFile));

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

  onSubmitEditMode() {
    if (this.editMode) {
      this.loading = true;
      if (this.imageFile || this.previousImageFile) {
        this.editWithImage();
      } else {
        this.editWithoutImage();
      }
    }
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  handleError(e) {
    const isJson = this.isJsonString(e);

    if (isJson) {
      const error = JSON.parse(e);
      const errorType = error && error.message ? error.message : '';

      switch (errorType) {
        case 'error.customer_not_assigned':
          this.toastrService.error(`Organization doesn't have a customer assigned`, 'Error');
          break;

        case 'error.band_exceed_total':
          this.toastrService.error(`The Licensed limit has been reached. Please contact your Account Manager`, 'Error');
          break;

        case 'error.module_not_contracted':
          this.toastrService.error(
            `To set up this module, review your License and contact your Account Manager `,
            'Error'
          );
          break;

        case 'error.contract_expired':
          this.toastrService.error(`Contract has expired. Please contact your Account Manager`, 'Error');
          break;

        case 'error.invalid_file_extension':
          this.toastrService.error(`Invalid image file extension`, 'Error');
          break;

        case 'error.new_term_exist':
          this.toastrService.info(`${this.termsForm.getRawValue().searchPhrase}`, 'Duplicated. Term not added.');
          break;

        default:
          this.toastrService.error('An error has occured. Term not added', 'Error');
          break;
      }
    } else {
      this.toastrService.error(e.body, 'Error');
    }
  }

  editWithImage() {
    if (this.imageFile) {
      this.updateSubmitData();
      this.currentFilterObservable = observableOf(null).pipe(delay(750));
      this.currentFilterObservable
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading = false;
          }),
          switchMap(() => {
            return this.settings.saveSettingsPut(this.settingId, this.resourceId, this.submitData);
          }),
          switchMap(() => {
            return this.settings.saveSettingsDataMultipartPut(this.resourceId, this.submitData, this.imageFile);
          })
        )
        .subscribe(
          () => {},
          (error) => {
            this.handleError(error);
            this.loading = false;
          }
        );
    } else if (this.previousImageFile) {
      this.updateSubmitData();
      this.currentFilterObservable = observableOf(null).pipe(delay(750));
      this.currentFilterObservable
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading = false;
          }),
          switchMap(() => {
            return this.settings.saveSettingsPut(this.settingId, this.resourceId, this.submitData);
          }),
          switchMap(() => {
            return this.settings.deleteSettingsImage(this.resourceId);
          })
        )
        .subscribe(
          () => {
            this.previousImageFile = false;
          },
          (error) => {
            this.handleError(error);
            this.loading = false;
          }
        );
    }
  }

  editWithoutImage() {
    this.currentFilterObservable = observableOf(null).pipe(delay(750));
    this.currentFilterObservable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        }),
        switchMap(() => {
          this.updateSubmitData();
          return this.settings.saveSettingsPut(this.settingId, this.resourceId, this.submitData);
        })
      )
      .subscribe(
        () => {},
        (error) => {
          this.handleError(error);
          this.loading = false;
        }
      );
  }

  onSubmitImageEditMode() {
    if (this.editMode) {
      if (this.imageFile) {
        this.updateSubmitData();
        this.settings
          .saveSettingsDataMultipartPut(this.resourceId, this.submitData, this.imageFile)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {},
            (error) => {
              this.handleError(error);
              this.loading = false;
            }
          );
      } else if (this.previousImageFile) {
        this.settings
          .deleteSettingsImage(this.resourceId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.previousImageFile = false;
            },
            (error) => {
              this.handleError(error);
              this.loading = false;
            }
          );
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

  onSubmitEdit() {
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
    ]);
  }

  onChangeImageHelp() {
    return (this.showImageHelp = !this.showImageHelp);
  }

  toggleShowInfo(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShowInfo = !this.isShowInfo;
  }

  navigateToDetail() {
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${this.resource.id}`
    ]);
  }

  openInfoModal() {
    this.isModalInfoOpen = !this.isModalInfoOpen;
  }

  openCloseInfoModal() {
    this.openSearchPhraseInfo = !this.openSearchPhraseInfo;
  }
}
