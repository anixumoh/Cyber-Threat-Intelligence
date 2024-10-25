import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { of as observableOf, forkJoin as observableForkJoin, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DetailNewEditAbstractComponent } from 'app/dashboard/module-sections/modulesettings/detail-new-edit/detail-new-edit-abstract.component';
import { FilterModel } from 'app/dashboard/organization/filterModels';
import { LabelsComponent } from 'app/dashboard/module-sections/shared/labels/labels.compontent';
import { union } from 'lodash';
import { emailRegexp } from 'app/utils/validators';

const typeSubmitList = {
  languages: 6,
  plugins: 8,
  terms: 4,
  countries: 9,
  label_assignation: 3,
  has_label: 7
};

@Component({
  selector: 'app-filters-generic-new-edit',
  templateUrl: './filters-generic-new-edit.component.html',
  styleUrls: ['./filters-generic-new-edit.component.scss'],
  host: { '(document:click)': 'onClickOutside($event)' }
})
export class FiltersGenericNewEditComponent extends DetailNewEditAbstractComponent implements OnInit, OnDestroy {
  @ViewChild('filterName') filterNameElementRef: ElementRef;
  @ViewChild('conditionsDiv') conditionsDivElementRef: ElementRef;
  @ViewChild('actionsDiv') actionsDivElementRef: ElementRef;
  @ViewChild('labelActionComponent') labelActionComponent: LabelsComponent;
  @ViewChild('dropDownUser') dropDownUser: ElementRef;
  @ViewChild('dropDownButtonUser') dropDownButtonUser: ElementRef;
  @ViewChild('tlpDropdown') tlpDropdown: ElementRef;
  @ViewChild('searchFilter') searchFilterRef: ElementRef;

  enableSubmitForm = false;
  newMode: boolean;
  modeText = 'Edit Mode';
  inverseText = 'View Mode';
  showMode: boolean;
  resourceName: any;
  extraDataInv: any;
  extraData = {
    key: '',
    value: ''
  };
  domainInv: any;
  domain: any;
  filterPhraseInv: any;
  filterPhrase: any;
  listUsersAdded: any[] = [];
  isMenuOpened = false;
  originList: any[] = [];
  rssFeeds: any[] = [];
  originListInv = false;
  languageList: any[] = [];
  languageListInv = false;
  countryList: any[] = [];
  countryListInv = false;
  hasLabelList: any[] = [];
  hasLabelListInv = false;
  actionLabelList: any[] = [];
  termList: any[] = [];
  termsListInv = false;
  filter = new FilterModel();
  actionsBase = this.filter.actions;
  conditionsBase = this.filter.conditions;
  nameExists = false;
  nameTouched = false;
  isMinAction = true;
  isMinActionTouched = false;
  isMinCondition = true;
  isMinConditionTouched = false;
  submitTouched = false;
  showAddUser = false;
  showAddEmail = false;
  emailError = '';
  invalidDomain = '';
  showAddTLP = false;
  loading = false;
  showTermsConditions = false;
  showLabelsConditions = false;
  showLabelsActions = false;
  convertType = {};
  pwdType = '';
  values: any;
  errorFieldAlert: string;
  filterPhraseError = false;
  searchOrigin = false;
  searchLanguage = false;
  searchTerm = false;
  searchCountry = false;
  searchLabels = false;
  searchActionLabels = false;
  listClone: any;
  saveAsModal = false;
  pwdMessages = {
    NO_PASSWORD: 'At least one credential from the threat is missing the username and password',
    CLEAR_PASSWORD:
      'At least one credential from the threat has clear password (plain text) and the username is not empty',
    HASHED_PASSWORD: 'At least one credential from the threat has hashed password and a valid username'
  };

  analysisResultArray = [
    { name: 'Not Available', key: 0, selected: false, disabled: false },
    { name: 'Important', key: 6, selected: false, disabled: false },
    { name: 'Positive', key: 3, selected: false, disabled: false },
    { name: 'Negative', key: 4, selected: false, disabled: false },
    { name: 'Informative', key: 5, selected: false, disabled: false },
    { name: 'Not Important', key: 1, selected: false, disabled: false },
    { name: 'Not Processable', key: 2, selected: false, disabled: false }
  ];

  analysisResultActionsArray = [
    { name: 'Important', key: 6, selected: false },
    { name: 'Positive', key: 3, selected: false },
    { name: 'Negative', key: 4, selected: false },
    { name: 'Informative', key: 5, selected: false },
    { name: 'Not Important', key: 1, selected: false }
  ];

  fileTypeArray = [
    { name: 'Html', key: 0, selected: false, formats: 'html,	xhtml' },
    { name: 'Image', key: 1, selected: false, formats: 'Any content type that starts with image/' },
    { name: 'Document', key: 2, selected: false, formats: 'doc, rtf, xls, vsd, pps, ppt, pdf' },
    { name: 'Others', key: 3, selected: false, formats: 'Any extension not included previously' }
  ];

  tlpArray = [
    { name: 'White', key: 'WHITE', selected: false, class: 'icon-lens white-tlp' },
    { name: 'Green', key: 'GREEN', selected: false, class: 'icon-lens text-success' },
    { name: 'Amber', key: 'AMBER', selected: false, class: 'icon-lens text-warning' },
    { name: 'Red', key: 'RED', selected: false, class: 'icon-lens text-danger' }
  ];

  tlpColors = {
    WHITE: 'icon-lens white-tlp',
    GREEN: 'icon-lens text-success',
    AMBER: 'icon-lens text-warning',
    RED: 'icon-lens text-danger'
  };

  currentStep = 0;
  selectedPlugins = [];
  selectedCountries = [];
  selectedLanguages = [];
  selectedTerms = [];
  selectedLabels = [];
  selectedActionLabels = [];
  isOpenShowMore = false;

  get name() {
    return this.termsForm.get('name');
  }

  ngOnInit() {
    if (this.router.url.indexOf('edit') > -1) {
      this.changeStatusMode(true, false, false);
    } else if (this.router.url.indexOf('new') > -1) {
      this.changeStatusMode(false, false, true);
      this.modeText = 'Create Mode';
    } else {
      this.changeStatusMode(false, true, false);
      [this.modeText, this.inverseText] = [this.inverseText, this.modeText];
    }

    const tempArrayObs = [this.organizationService.getCurrentContext, this.loadData];

    const tempArrayCb = [
      (context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      },
      (resource) => {
        if (resource) {
          this.resource = resource;
          this.resource[1].has_label = this.resource[1].labels;
          this.resource[1].label_assignation = this.resource[1].labels;
          const feedsTitle = {
            value: '--- RSS ---',
            label: '--- RSS ---',
            disabled: true
          };
          this.rssFeeds = this.resource[1].rssFeeds.map(({ label, value }: any) => {
            return {
              label,
              value,
              id: value,
              isRss: true
            };
          });

          this.rssFeeds.unshift(feedsTitle);
          this.setTermsForm();
        }
      }
    ];

    const tempContext = [this.organizationService, this];
    this.setInitContext(tempArrayObs, tempArrayCb, tempContext);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toggleOpenShowMore() {
    this.isOpenShowMore = !this.isOpenShowMore;
  }

  changeStatusMode(editMode: boolean, showMode: boolean, newMode: boolean) {
    this.editMode = editMode;
    this.showMode = showMode;
    this.newMode = newMode;
  }

  onClickOutside(event) {
    if (this.checkDropDown(event.target) && this.checkDropDownButton(event.target)) {
      this.isMenuOpened = false;
    }

    if (event.target.id !== 'tlp-btn') {
      if (this.checkTlp(event.target)) {
        this.showAddTLP = false;
      }
    }
  }

  checkTlp(target) {
    return this.tlpDropdown && !this.tlpDropdown.nativeElement.contains(target);
  }

  checkDropDown(target) {
    return this.dropDownUser && this.dropDownUser.nativeElement && !this.dropDownUser.nativeElement.contains(target);
  }

  checkDropDownButton(target) {
    return (
      this.dropDownButtonUser &&
      this.dropDownButtonUser.nativeElement &&
      !this.dropDownButtonUser.nativeElement.contains(target)
    );
  }

  loadDataSettings(getSettingsDataView = true) {
    return observableForkJoin([
      getSettingsDataView ? this.settings.getSettingsDataView(this.settingId, this.resourceId) : observableOf({}),
      this.settings.getFilterLists(),
      this.settings.getSettingsData('terms', 1, 1000, true)
    ]);
  }

  loadData(): Observable<any> {
    if (this.settingId && this.activeModule?.id && this.activeOrganization) {
      if (this.editMode || this.showMode) {
        return this.loadDataSettings();
      } else if (this.newMode) {
        return this.loadDataSettings(false);
      }
    } else {
      return observableOf(null);
    }
  }

  readConditionValues() {
    let name = '';
    let filterPhrase = '';
    let filterPhraseInv = false;
    let domain = '';
    let domainInv = false;

    name = this.resource[0].name;
    this.resource[0].conditions.forEach((cond) => {
      if (cond.type === 'DOMAIN') {
        if (cond.value[0]) {
          domain = cond.value[0];
        }
        domainInv = cond.inverse;
      } else if (cond.type === 'FILTER_PHRASE') {
        if (cond.value[0] === 'undefined' || cond.value.length === 0) {
          cond.value[0] = '';
        }
        filterPhrase = (cond.value[0] || '').trim();
        filterPhraseInv = cond.inverse || false;
      } else if (cond.type === 'ANALYSIS_RESULT') {
        const checked = cond.value;
        this.analysisResultArray.forEach((wt, index) => {
          if (checked.indexOf(wt.key.toString()) >= 0) {
            this.analysisResultArray[index].selected = true;
          }
        });
        if (this.analysisResultArray[1].selected) {
          this.analysisResultArray[2].disabled = true;
          this.analysisResultArray[3].disabled = true;
          this.analysisResultArray[4].disabled = true;
        }
      } else if (cond.type === 'FILE_TYPE') {
        const checked = cond.value;
        this.fileTypeArray.forEach((wt, index) => {
          if (checked.indexOf(wt.key.toString()) >= 0) {
            this.fileTypeArray[index].selected = true;
          }
        });
      } else if (cond.type === 'EXTRADATA_ENTRY') {
        if (cond.value[0]) {
          this.extraData = JSON.parse(cond.value[0]);
        } else {
          this.extraData.key = '';
          this.extraData.value = '';
        }
        this.extraDataInv = cond.inverse;
      } else if (cond.type === 'TERM') {
        this.termsListInv = cond.inverse;
      } else if (cond.type === 'LANGUAGE') {
        this.languageListInv = cond.inverse;
      } else if (cond.type === 'COUNTRY') {
        this.countryListInv = cond.inverse;
      } else if (cond.type === 'ORIGIN') {
        this.originListInv = cond.inverse;
      } else if (cond.type === 'HAS_LABEL') {
        this.hasLabelListInv = cond.inverse;
      }
    });

    this.resourceName = name;
    this.filterPhrase = filterPhrase;

    this.filterPhraseInv = filterPhraseInv;
    this.domain = domain;
    this.domainInv = domainInv;
  }

  readActionValues() {
    this.resource[0].actions.forEach((action) => {
      if (action.type === 'MARK_TLP_LIGHT') {
        if (action?.value?.length) {
          this.tlpArray.forEach((wt, index) => {
            if (action.value === wt.key) {
              this.tlpArray[index].selected = true;
            }
          });
        }
      } else if (action.type === 'LAUNCH_ALERT') {
        if (!action.hasOwnProperty('value')) {
          action.value = true;
        }
        this.listUsersAdded = action.alertConfiguration.destinations;
      } else if (action.type === 'DELETE' || action.type === 'CUT_EXECUTION') {
        if (!action.hasOwnProperty('value')) {
          action.value = true;
        }
      } else if (action.type === 'ANALYSIS_RESULT_ASSIGNATION') {
        if (action.value) {
          this.analysisResultActionsArray.forEach((analysisResult, index) => {
            if (+action.value === analysisResult.key) {
              this.analysisResultActionsArray[index].selected = true;
            }
          });
        }
      }
    });

    if (this.resource[0].actions[1].value === 'true') {
      this.resource[0].actions[1].value = true;
    }
    if (this.resource[0].actions[1] === 'false') {
      this.resource[0].actions[1].value = false;
    }

    if (this.resource[0].actions[2].value === 'true') {
      this.resource[0].actions[2].value = true;
    }
    if (this.resource[0].actions[2] === 'false') {
      this.resource[0].actions[2].value = false;
    }
  }

  updateSubmitList(children) {
    this.setArrayValues(typeSubmitList[children], children);
  }

  setArrayValues(index, children) {
    if (children === 'label_assignation') {
      if (this.actionLabelList) {
        const form = JSON.parse(JSON.stringify(this.termsForm.value[children]));
        this.resource[0].actions[index].value = form
          .filter((element) => {
            if (element.selected) {
              return element;
            }
          })
          .map(({ value }: any) => value)
          .toString();
      }
    } else if (children === 'has_label') {
      if (this.hasLabelList) {
        const form = JSON.parse(JSON.stringify(this.termsForm.value[children]));
        this.resource[0].conditions[index].value = [];
        this.resource[0].conditions[index].value.push(
          form
            .filter((element) => {
              if (element.selected) {
                return element;
              }
            })
            .map((element) => {
              return element.value;
            })
            .toString()
        );
      }
    } else if (children === 'plugins') {
      if (this.termsForm.value[children]) {
        const form = JSON.parse(JSON.stringify(this.termsForm.value[children]));
        this.resource[0].conditions[index].origins = form
          .filter((element) => {
            if (element.selected) {
              return element;
            }
          })
          .map((element) => {
            if (
              element.value !== 'FACEBOOK' &&
              element.value !== 'TWITTER' &&
              element.value !== 'NEWS' &&
              element.value !== 'MANUAL' &&
              !element.isRss
            ) {
              element.type = 'TRANSFORM';
            } else if (element.isRss) {
              element.type = 'RSS';
              delete element.isRss;
            } else {
              element.type = element.value;
              delete element.value;
            }
            delete element.label;
            delete element.selected;
            delete element.id;
            this.resource[0].conditions[8].value = [];
            return element;
          });
      }
    } else if (children === 'terms' || children === 'languages' || children === 'countries') {
      if (this.termsForm.value[children]) {
        const form = JSON.parse(JSON.stringify(this.termsForm.value[children]));
        this.resource[0].conditions[index].value = form
          .filter((element) => {
            return element.selected;
          })
          .map((element) => {
            return element.value.toString();
          });
      }
    } else {
      if (this.termsForm.value[children]) {
        const form = JSON.parse(JSON.stringify(this.termsForm.value[children]));
        this.resource[0].conditions[index].value = form.filter((element) => {
          return element.selected;
        });
      }
    }
  }

  isNameExisting() {
    this.nameTouched = true;
    this.nameExists = !!(this.resource[0].name && this.resource[0].name !== '');
    return this.nameExists;
  }

  updateSubmitData() {
    this.resource[0].name = this.termsForm.value.name ? this.termsForm.value.name.trim() : '';

    const actions = this.resource[0].actions;

    actions.map((action, index) => {
      if (action.type === 'LAUNCH_ALERT') {
        this.resource[0].actions[index].alertConfiguration.destinations = this.listUsersAdded;
      }
    });
    const conditions = this.resource[0].conditions;
    conditions.forEach((condition, index) => {
      if (condition.type === 'FILTER_PHRASE') {
        if (this.filterPhrase) {
          conditions[index].value = [];
          conditions[index].value.push(this.filterPhrase.trim());
          conditions[index].inverse = this.termsForm.value.filterPhraseInv ? true : false;
        } else {
          conditions[index].value = [''];
        }
      } else if (condition.type === 'DOMAIN') {
        conditions[index].value = this.termsForm.value.domain ? [this.termsForm.value.domain.trim()] : [];
        conditions[index].inverse = this.termsForm.value.domainInv ? true : false;
      } else if (condition.type === 'EXTRADATA_ENTRY' && this.termsForm.value.extraData) {
        conditions[index].value = [JSON.stringify(this.termsForm.value.extraData)];
        conditions[index].inverse = this.termsForm.value.extraDataInv ? true : false;
      } else if (condition.type === 'TERM') {
        this.resource[0].conditions[index].inverse = this.termsForm.value.termsListInv ? true : false;
      } else if (condition.type === 'LANGUAGE') {
        this.resource[0].conditions[index].inverse = this.termsForm.value.languageListInv ? true : false;
      } else if (condition.type === 'COUNTRY') {
        this.resource[0].conditions[index].inverse = this.termsForm.value.countryListInv ? true : false;
      } else if (condition.type === 'ORIGIN') {
        this.resource[0].conditions[index].inverse = this.termsForm.value.originListInv ? true : false;
      } else if (condition.type === 'HAS_LABEL') {
        this.resource[0].conditions[index].inverse = this.termsForm.value.hasLabelListInv ? true : false;
      }
    });
    this.updateSubmitList('plugins');
    this.updateSubmitList('countries');
    this.updateSubmitList('languages');
    this.updateSubmitList('terms');
    this.updateSubmitList('label_assignation');
    this.updateSubmitList('has_label');

    if (this.submitTouched) {
      this.isNameExisting();
      this.minActions();
      this.minConditions();
    }
  }

  minActions() {
    let action = 0;
    this.isMinAction = false;
    this.isMinActionTouched = true;
    if (
      this.resource[0].actions[0].value === '' ||
      this.resource[0].actions[0].value === 0 ||
      this.resource[0].actions[0].value === '0'
    ) {
      action++;
    }
    if (this.resource[0].actions[1].value === false) {
      action++;
    }
    if (this.resource[0].actions[2].value === false) {
      action++;
    }
    if (this.resource[0].actions[3].value === '') {
      action++;
    }
    if (this.resource[0].actions[4].value === false) {
      action++;
    }
    if (this.resource[0].actions[5].value === '') {
      action++;
    }
    if (
      this.resource[0].actions[6].value === '' ||
      this.resource[0].actions[6].value === 0 ||
      this.resource[0].actions[6].value === '0'
    ) {
      action++;
    }
    if (action !== 7) {
      this.isMinAction = true;
      return true;
    } else {
      this.isMinAction = false;
      this.actionsDivElementRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      return false;
    }
  }

  minConditions(stepper?) {
    let condition = 0;
    this.isMinCondition = false;
    this.isMinConditionTouched = true;

    if (this.resource[0].conditions[0].value.length === 0) {
      condition++;
    }
    if (this.resource[0].conditions[1].value[0] === '') {
      condition++;
    }
    if (this.resource[0].conditions[2].value.length === 0) {
      condition++;
    }
    if (!this.termsForm.value.domain) {
      condition++;
    }
    if (this.resource[0].conditions[4].value.length === 0) {
      condition++;
    }

    const cond = this.termsForm.value.extraData;
    if (cond.key === '' || cond.value === '') {
      condition++;
    }
    if (this.resource[0].conditions[6].value.length === 0) {
      condition++;
    }
    if (this.resource[0].conditions[7].value[0] === '') {
      condition++;
    }
    if (this.resource[0].conditions[8].origins.length === 0) {
      condition++;
    }
    if (this.resource[0].conditions[9].value.length === 0) {
      condition++;
    }

    if (condition !== 10) {
      this.isMinCondition = true;
      return true;
    } else {
      this.isMinCondition = false;
      if (!stepper) {
        this.conditionsDivElementRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
      return false;
    }
  }

  extraDataCondition() {
    const key = this.termsForm.value.extraData.key !== '' ? this.termsForm.value.extraData.key : null;
    const value = this.termsForm.value.extraData.value !== '' ? this.termsForm.value.extraData.value : null;

    return value === null || key === null;
  }

  getClonedData(data) {
    const dataClone = JSON.parse(JSON.stringify(data));
    if (this.extraDataCondition()) {
      dataClone.conditions.splice(5, 1);
    }
    if (
      dataClone.conditions[3].value[0] === 0 ||
      dataClone.conditions[3].value[0] === '' ||
      dataClone.conditions[3].value[0] === undefined
    ) {
      dataClone.conditions.splice(3, 1);
    }
    if (dataClone.conditions[1].value.length > 1) {
      dataClone.conditions[1].value.splice(1, dataClone.conditions[1].value.length);
    }

    if (dataClone.actions[4] && dataClone.actions[4].type === 'LAUNCH_ALERT') {
      if (dataClone.actions[4].value === false) {
        dataClone.actions.splice(4, 1);
      } else {
        delete dataClone.actions[4].value;
      }
    }
    if (dataClone.actions[2] && dataClone.actions[2].type === 'DELETE') {
      if (dataClone.actions[2].value === false) {
        dataClone.actions.splice(2, 1);
      }
    }
    if (dataClone.actions[1] && dataClone.actions[1].type === 'CUT_EXECUTION') {
      if (dataClone.actions[1].value === false) {
        dataClone.actions.splice(1, 1);
      }
    }

    if (!dataClone.hasOwnProperty('generated')) {
      dataClone.generated = false;
      dataClone.enabled = true;
      dataClone.status = 'OK';
      dataClone.messages = [];
    }
    return dataClone;
  }

  setConverList() {
    this.convertType = {
      ORIGIN: {
        addList: (tempArray) => {
          const origins = [];
          const pluginsTitle = {
            value: '--- Transforms ---',
            label: '--- Transforms ---',
            disabled: true,
            selected: false
          };
          tempArray.unshift(pluginsTitle);
          const temp = [...tempArray, ...(this.rssFeeds || [])];
          const tempToReturn = [];
          const selected = [];
          temp.unshift({ label: 'Manual', value: 'MANUAL', selected: false });
          temp.unshift({ label: 'News', value: 'NEWS', selected: false });
          temp.unshift({ label: 'Twitter', value: 'TWITTER', selected: false });
          if (!this.newMode) {
            const el = this.resource[0].conditions.find((element) => {
              return element.type === 'ORIGIN';
            });
            el.origins.forEach((or) => {
              origins.push(or.value ? or.value : or.type);
            });
          }
          for (const def of temp) {
            const { label, value, id, disabled, isRss } = def;
            const obj = {
              label,
              disabled,
              isRss,
              selected: false,
              value: value ?? id
            };
            const upperOrigins = origins.map((origin) => {
              return origin.toUpperCase();
            });
            if ((!this.newMode && origins.indexOf(def.value) >= 0) || upperOrigins.indexOf(def.value) >= 0) {
              obj.selected = true;
              selected.push(obj);
            } else {
              tempToReturn.push(obj);
            }
          }

          this.originList = selected.concat(tempToReturn);
        },
        key: 'plugins'
      },
      LANGUAGE: {
        addList: (tempArray) => {
          let languages = [];
          const temp = [];
          const selected = [];
          if (!this.newMode) {
            const el = this.resource[0].conditions.find((element) => {
              return element.type === 'LANGUAGE';
            });
            languages = [...el.value];
          }
          for (const def of tempArray) {
            const { label, value, id } = def;
            const obj = {
              label,
              value: value ?? id,
              selected: false
            };
            if (!this.newMode && languages.indexOf(def.value) >= 0) {
              obj.selected = true;
              selected.push(obj);
            } else {
              temp.push(obj);
            }
          }
          this.languageList = selected.concat(temp);
        },
        key: 'languages'
      },
      COUNTRY: {
        addList: (tempArray) => {
          let countries;
          const temp = [];
          const selected = [];
          // WHY NOT NEW MODE???
          if (!this.newMode) {
            const el = this.resource[0].conditions.find((element) => {
              return element.type === 'COUNTRY';
            });
            countries = [...el.value];
          }
          for (const def of tempArray) {
            const { label, value, id } = def;
            const obj = {
              label,
              value: value ?? id,
              selected: false
            };
            if (!this.newMode && countries.indexOf(def.value) >= 0) {
              obj.selected = true;
              selected.push(obj);
            } else {
              temp.push(obj);
            }
          }
          this.countryList = selected.concat(temp);
        },
        key: 'countries'
      },
      TERM: {
        addList: (tempArray) => {
          let terms = [];
          const temp = [];
          if (!this.newMode) {
            const el = this.resource[0].conditions.find((element) => {
              return element.type === 'TERM';
            });
            terms = [...el.value];
          }
          for (const value in tempArray) {
            if (value) {
              const ind = Object.keys(tempArray[value]).indexOf('value');
              if (ind >= 0) {
                const term = tempArray[value];
                const obj = {
                  label: term.value,
                  value: term.id,
                  selected: false
                };
                if (terms.indexOf(term.id.toString()) >= 0) {
                  obj.selected = true;
                  temp.unshift(obj);
                } else {
                  temp.push(obj);
                }
              } else {
                const term = tempArray[value];
                const obj = {
                  label: term.searchPhrase,
                  value: term.id,
                  selected: false
                };
                if (!this.newMode && terms.indexOf(term.id.toString()) >= 0) {
                  obj.selected = true;
                  temp.unshift(obj);
                } else {
                  temp.push(obj);
                }
              }
            }
          }
          this.termList = temp;
        },
        key: 'terms'
      },
      HAS_LABEL: {
        addList: (tempArray) => {
          const labels = [];
          const temp = [];
          const selected = [];
          if (!this.newMode) {
            this.resource[0].conditions
              .filter((element) => {
                return element.type === 'HAS_LABEL';
              })
              .forEach((element) => {
                if (element.value && element.value.length > 1) {
                  const item = element.value;
                  item.forEach((value) => {
                    labels.push(value);
                  });
                } else if (element.value && element.value[0]) {
                  const item = element.value[0].split(',');
                  item.forEach((value) => {
                    labels.push(value);
                  });
                }
              });
          }
          for (const label of tempArray) {
            const obj = {
              label: label.label,
              value: label.value ? label.value : label.id,
              selected: false
            };
            if (!this.newMode && labels.indexOf(label.id.toString()) >= 0) {
              obj.selected = true;
              selected.push(obj);
            } else {
              temp.push(obj);
            }
          }
          this.hasLabelList = selected.concat(temp);
        },
        key: 'labels'
      },
      LABEL_ASSIGNATION: {
        addList: (tempArray) => {
          const labels = [];
          const temp = [];
          const selected = [];
          if (!this.newMode) {
            this.resource[0].actions
              .filter((element) => {
                return element.type === 'LABEL_ASSIGNATION';
              })
              .forEach((element) => {
                if (element.value) {
                  if (element.value) {
                    const item = element.value.replace('[', '').replace(']', '').split(',');
                    item.forEach((label) => {
                      labels.push(label.trim());
                    });
                  }
                }
              });
          }
          for (const label of tempArray) {
            const obj = {
              label: label.label,
              value: label.value ? label.value : label.id,
              selected: false,
              background_color: label.bgColor,
              text_color: label.textColor
            };
            if (!this.newMode && labels.indexOf(label.id.toString()) >= 0) {
              obj.selected = true;
              selected.push(obj);
            } else {
              temp.push(obj);
            }
          }
          this.actionLabelList = selected.concat(temp);
        },
        key: 'label_assignation'
      }
    };
  }

  setConditionsValues() {
    if (this.resource[0].conditions && this.resource[0].conditions[0]) {
      if (
        (this.resource[0].conditions[0] && this.resource[0].conditions[0].type === 'NO_PASSWORD') ||
        this.resource[0].conditions[0].type === 'CLEAR_PASSWORD' ||
        this.resource[0].conditions[0].type === 'HASHED_PASSWORD'
      ) {
        this.pwdType = this.resource[0].conditions[0].type;
      }
      this.resource[0].conditions.forEach((condition) => {
        this.conditionsBase.forEach((conditionBase, index) => {
          if (conditionBase.type === condition.type) {
            this.conditionsBase[index] = condition;
          }
        });
      });
      this.resource[0].conditions = this.conditionsBase;
    }
  }

  setActionValues() {
    this.resource[0].actions.forEach((action) => {
      this.actionsBase.forEach((actionBase, index) => {
        if (actionBase.type === action.type) {
          this.actionsBase[index] = action;
        }
      });
    });
    this.resource[0].actions = this.actionsBase;
  }

  setTermsForm() {
    this.setConverList();
    if (!this.newMode) {
      if (this.resource[0].conditions[0]) {
        this.readConditionValues();
        this.setConditionsValues();
      } else {
        this.resource[0].conditions = this.conditionsBase;
      }

      if (this.resource[0].actions) {
        this.setActionValues();
        this.readActionValues();
      } else {
        this.resource[0].actions = this.actionsBase;
      }
    } else {
      this.resource[0].conditions = this.conditionsBase;
      this.resource[0].actions = this.actionsBase;
    }

    let termList = [];
    if (this.resource[2]) {
      termList = this.resource[2].values;
    } else {
      this.filterPhrase = '';
    }

    this.convertType['TERM'].addList.call(this, termList);

    for (const type in this.convertType) {
      if (type !== 'TERM') {
        let tempList = [];
        if (this.resource[1][this.convertType[type].key]) {
          tempList = this.resource[1][this.convertType[type].key];
        }
        this.convertType[type].addList.call(this, tempList);
      }
    }

    const nameRegex = new RegExp(/^(?!\*|\?).*/);

    this.termsForm = new UntypedFormGroup({
      name: new UntypedFormControl(this.resourceName, [Validators.required, Validators.pattern(nameRegex)]),
      filterPhraseInv: new UntypedFormControl(this.filterPhraseInv),
      domain: new UntypedFormControl(this.domain),
      domainInv: new UntypedFormControl(this.domainInv),
      plugins: new UntypedFormControl(this.originList),
      originListInv: new UntypedFormControl(this.originListInv),
      languages: new UntypedFormControl(this.languageList),
      languageListInv: new UntypedFormControl(this.languageListInv),
      terms: new UntypedFormControl(this.termList),
      termsListInv: new UntypedFormControl(this.termsListInv),
      countries: new UntypedFormControl(this.countryList),
      countryListInv: new UntypedFormControl(this.countryListInv),
      hasLabelListInv: new UntypedFormControl(this.hasLabelListInv),
      has_label: new UntypedFormControl(this.hasLabelList),
      label_assignation: new UntypedFormControl(this.actionLabelList),
      extraData: new UntypedFormGroup({
        key: new UntypedFormControl(this.extraData.key),
        value: new UntypedFormControl(this.extraData.value)
      }),
      extraDataInv: new UntypedFormControl(this.extraDataInv)
    });

    this.shouldShowTermsLabels();
  }

  shouldShowTermsLabels() {
    this.termList.forEach((term) => {
      if (term.selected) {
        return (this.showTermsConditions = true);
      }
    });

    this.hasLabelList.forEach((label) => {
      if (label.selected) {
        return (this.showLabelsConditions = true);
      }
    });

    this.actionLabelList.forEach((label) => {
      if (label.selected) {
        return (this.showLabelsActions = true);
      }
    });
  }

  onSubmitEditMode() {
    if (this.editMode && this.minActions() && this.minConditions()) {
      this.loading = true;
    }
  }

  onSubmit(saveAs?) {
    this.termsForm.controls.name.markAsTouched();
    this.nameTouched = true;

    if (!this.termsForm.controls.name.valid) {
      return;
    }

    this.isNameExisting();
    this.minActions();
    this.minConditions();
    this.loading = true;
    this.submitTouched = true;
    this.enableSubmitForm = true;
    this.updateSubmitData();
    const dataClone = this.getClonedData(this.resource[0]);

    if (this.newMode && this.enableSubmitForm) {
      delete dataClone.orden;
      if (this.termsForm.value.name) {
        this.nameExists = true;
        this.resource[0].name = this.termsForm.value.name.trim();
      }
      if (!this.nameExists) {
        this.loading = false;
        this.filterNameElementRef.nativeElement.focus();
        return;
      } else if (!this.isMinCondition) {
        this.loading = false;
        return;
      } else if (!this.isMinAction) {
        this.loading = false;
        return;
      }

      this.settings
        .createFiltersData(dataClone)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            this.saveAsModal = false;
            this.loading = false;
            this.editMode = true;
            this.newMode = false;
            this.navigateToEdit(res.id, false);
          },
          ({ error }) => {
            this.checkError(error.message);
          }
        );
    } else if (this.editMode) {
      if (!this.nameExists) {
        this.filterNameElementRef.nativeElement.focus();
        this.loading = false;
        return;
      } else if (!this.isMinCondition) {
        this.loading = false;
        return;
      } else if (!this.isMinAction) {
        this.loading = false;
        return;
      }

      if (!saveAs) {
        this.settings
          .saveFiltersData(dataClone)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.toastrService.success('Filter was succesfully edited', 'Success');
              this.loading = false;
            },
            (error) => {
              const body = error || '';
              this.checkError(body.message);
            }
          );
      } else {
        this.openCloseSaveAsModal();
      }
    }
  }

  markFormAsTouched() {
    this.termsForm.markAsTouched();
  }

  updateFilterRating(rated) {
    if (!this.showMode) {
      this.resource[0].actions[6].value = rated;
      this.settings.saveFiltersData(this.resource);
      this.termsForm.markAsTouched();
    }
  }

  filterChangeCheckbox(order: number) {
    // this.resource[0].actions[order].value = !this.resource[0].actions[order].value;
    if (order === 4 && this.resource[0].actions[order].value === false) {
      this.resetAlertVariables('launch');
    }
    this.termsForm.markAsTouched();
  }

  resetAlertVariables(type) {
    if (type === 'launch') {
      this.resource[0].actions[4].value = false;
    }
    this.resource[0].actions[4].alertConfiguration.filterActionId = '';
    this.resource[0].actions[4].alertConfiguration.threshold = '1';
    this.resource[0].actions[4].alertConfiguration.interval = '1';
    this.resource[0].actions[4].alertConfiguration.sendAlert = false;
    this.resource[0].actions[4].alertConfiguration.sendAlertInterval = '1';
    this.resource[0].actions[4].alertConfiguration.immediateSending = false;
    this.resource[0].actions[4].alertConfiguration.destinations = this.listUsersAdded = [];
    this.termsForm.markAsTouched();
  }

  filterChangeSendAlertCheckbox(text: string) {
    if (text === 'sendAlert' && this.resource[0].actions[4].alertConfiguration[text] === false) {
      this.resetAlertVariables('sendAlert');
    }
  }

  filterSendAlertText(text: string, value: string) {
    this.resource[0].actions[4].alertConfiguration[text] = value;
    this.termsForm.markAsTouched();
  }

  toggleMenu() {
    this.values = this.usersList;
    this.isMenuOpened = !this.isMenuOpened;
  }

  closeAddInput(type) {
    switch (type) {
      case 'email':
        this.showAddEmail = false;
        this.emailError = '';
        break;
      case 'user':
        this.showAddUser = false;
        this.isMenuOpened = false;
        break;
    }
  }

  selectEmail(mail) {
    if (!this.regexForEmail(mail)) {
      return (this.emailError = 'Invalid e-mail');
    }
    const userTemp = {
      usersId: null,
      usersName: null,
      userEmail: mail,
      emailEnabled: true
    };

    function userToFind(entry) {
      if (entry.usersId) {
        return entry.usersId === userTemp.usersId;
      } else {
        return entry.userEmail === userTemp.userEmail;
      }
    }

    const userIndex = this.usersList.findIndex((user) => user.email === mail);

    if (userIndex > -1) {
      this.selectUser(this.usersList[userIndex]);
      this.emailError = '';
      this.showAddEmail = false;
    } else {
      let filterByType = null;

      filterByType = this.listUsersAdded.find(userToFind);

      if (!filterByType) {
        this.listUsersAdded.push(userTemp);
        this.resource[0].actions.map((action, index) => {
          if (action.type === 'LAUNCH_ALERT') {
            this.resource[0].actions[index].alertConfiguration.destinations = this.listUsersAdded;
          }
        });
        this.emailError = '';
        this.showAddEmail = false;
      } else {
        this.toastrService.error('That e-mail was already added', 'Error');
      }
    }
    this.termsForm.markAsTouched();
  }

  selectUser(user) {
    const userTemp = {
      usersId: user.id,
      usersName: user.name + ' ' + user.firstSurname,
      userEmail: user.email,
      emailEnabled: true
    };
    let filterByType = null;

    function userToFind(entry) {
      if (entry.usersId) {
        return entry.usersId === userTemp.usersId;
      } else {
        return entry.userEmail === userTemp.userEmail;
      }
    }

    filterByType = this.listUsersAdded.find(userToFind);
    if (!filterByType) {
      this.listUsersAdded.push(userTemp);
    } else {
      this.toastrService.error('That user was already added', 'Error');
    }
    this.showAddUser = false;
    this.termsForm.markAsTouched();
  }

  deleteUser(id, mail) {
    if (!this.showMode) {
      const newArray = this.listUsersAdded.filter((object) => {
        if (id) {
          if (object.usersId !== id) {
            return object;
          }
        } else {
          if (object.userEmail !== mail) {
            return object;
          }
        }
      });
      this.listUsersAdded = newArray;
      this.resource[0].actions[4].alertConfiguration.destinations = newArray;
      this.termsForm.markAsTouched();
    }
  }

  setElementsMultiClick(array: any[], index: number, condition: string) {
    const { selected, value } = array[index];
    array[index].selected = !selected;
    this.termsForm.get(condition).value.forEach((element: any) => {
      if (element.value === value) {
        element.selected = array[index].selected;
      }
    });
  }

  multiClickFilters($event: any) {
    const { condition, index } = $event;
    let arrayControl = [];
    const conditions = this.resource[0].conditions;
    let setArray = [];
    if (condition === 'ANALYSIS_RESULT') {
      this.analysisResultArrayCond(index);
      setArray = this.analysisResultArray;
    } else if (condition === 'FILE_TYPE') {
      setArray = this.fileTypeArray;
      setArray[index].selected = !setArray[index].selected;
    } else if (condition === 'ORIGIN') {
      setArray = this.originList;
      const { selected, value } = setArray[index];
      setArray[index].selected = !selected;
      this.termsForm.get('plugins').value.forEach((element: any) => {
        if (element.value === value) {
          element.selected = setArray[index].selected;
        }
      });
    } else if (condition === 'LANGUAGE') {
      this.setElementsMultiClick(this.languageList, index, 'languages');
    } else if (condition === 'TERM') {
      this.setElementsMultiClick(this.termList, index, 'terms');
    } else if (condition === 'COUNTRY') {
      this.setElementsMultiClick(this.countryList, index, 'countries');
    } else if (condition === 'HAS_LABEL') {
      this.setElementsMultiClick(this.hasLabelList, index, 'has_label');
    }

    if (condition === 'LANGUAGE' || condition === 'COUNTRY' || condition === 'TERM') {
      arrayControl = setArray.filter(({ selected }: any) => selected).map(({ value }: any) => value);
    } else {
      arrayControl = setArray.filter(({ selected }: any) => selected).map(({ key }: any) => key);
    }
    conditions.forEach((cond, i) => {
      if (cond.type === condition) {
        this.resource[0].conditions[i].value = arrayControl;
      }
    });
    this.termsForm.markAsTouched();
  }

  analysisResultArrayCond(index) {
    this.analysisResultArray[index].selected = !this.analysisResultArray[index].selected;
    if (this.analysisResultArray[1].selected) {
      this.analysisResultArray[2].disabled = true;
      this.analysisResultArray[3].disabled = true;
      this.analysisResultArray[4].disabled = true;
      this.analysisResultArray[2].selected = false;
      this.analysisResultArray[3].selected = false;
      this.analysisResultArray[4].selected = false;
    } else {
      this.analysisResultArray[2].disabled = false;
      this.analysisResultArray[3].disabled = false;
      this.analysisResultArray[4].disabled = false;
    }
    this.termsForm.markAsTouched();
  }

  removeTLP() {
    this.tlpArray.forEach((tlp) => {
      tlp.selected = false;
    });

    this.resource[0].actions[5].value = '';

    this.showAddTLP = !this.showAddTLP;
    this.termsForm.markAsTouched();
  }

  multiClickActions($event: any) {
    const { index, arrayName, actionPosition } = $event;
    if (this.showAddTLP) {
      this.showAddTLP = false;
    }

    if (arrayName !== 'actionLabelList') {
      this?.[arrayName].forEach?.((element, i) => {
        if (i !== index) {
          element.selected = false;
        }
      });
      this[arrayName][index].selected = !this[arrayName][index].selected;
    } else {
      this.setElementsMultiClick(this.actionLabelList, index, 'label_assignation');
    }

    this.resource[0].actions[actionPosition].value = this[arrayName][index].selected
      ? this[arrayName][index].key
        ? this[arrayName][index].key
        : this[arrayName][index].value
      : '';

    this.termsForm.markAsTouched();
  }

  editGenerated() {
    this.resource[0].generated = !this.resource[0].generated;
  }

  userEnabled(index) {
    if (!this.showMode) {
      this.listUsersAdded[index].emailEnabled = !this.listUsersAdded[index].emailEnabled;
    }
  }

  updateTextArea(value) {
    this.filterPhrase = value;
    this.termsForm.markAsTouched();
  }

  navigateToEdit(id: number, closeModal) {
    if (closeModal) {
      this.closeMenu();
    }

    this.resource[0].id = id;

    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/filters/${id}/edit`
    ]);
  }

  sortArrayBySelected(array, attr) {
    const selected = [];
    const notSelected = [];
    let newArray = [];
    array.forEach((el) => {
      if (el.selected) {
        selected.push(el);
      } else {
        notSelected.push(el);
      }
    });
    newArray = union(
      [...selected].sort((a, b) => {
        return a[attr] > b[attr] ? 1 : b[attr] > a[attr] ? -1 : 0;
      }),
      notSelected
    );
    return newArray;
  }

  searchInList(event): void {
    this.errorFieldAlert = null;
    this.isMenuOpened = true;
    const word = event.target.value.toLowerCase();
    if (word.length > 0) {
      this.values = this.usersList;
      const temp = [];
      this.values.forEach((value) => {
        if (value.username.toLowerCase().indexOf(word) >= 0) {
          temp.push(value);
        }
      });
      if (temp.length === 0) {
        this.isMenuOpened = false;
        if (this.regexForEmail(word) && event.key === 'Enter') {
          const customUser = {
            id: null,
            name: 'Custom User',
            email: word
          };
          this.selectUser(customUser);
        } else if (!this.regexForEmail(word) && event.key === 'Enter') {
          this.errorFieldAlert = 'Please insert correct email format (blue@liv.com)';
        }
      }
      this.values = temp;
    } else {
      this.values = this.usersList.name;
      this.isMenuOpened = false;
    }
  }

  regexForEmail(email) {
    return email.toLowerCase().match(emailRegexp);
  }

  goToShowMode() {
    this.showMode = true;
    this.editMode = false;
    this.openModalDetail();
  }

  onCreateLabel(e) {
    const obj = {
      label: e.label,
      value: e.value ? e.value : e.id,
      selected: true,
      background_color: e.bgColor,
      text_color: e.textColor
    };

    this.actionLabelList.unshift(obj);
    this.listClone.listData.unshift(obj);
  }

  regexForDomain(domain) {
    const domainRegex = '^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
    return domain.match(domainRegex);
  }

  checkDomainFormat(e) {
    const domain = e.target.value;
    this.invalidDomain = (domain && !this.regexForDomain(domain) && 'Please, provide a valid domain') || '';
    this.termsForm.markAsTouched();
  }

  isUserUnableToEditFilter() {
    return this.grants.isCustomerOrOperator() || (this.grants.isAnalyst() && this.resource[0].generated);
  }

  getFilterActionStatus(index: number): 'Activated' | 'Deactivated' {
    return JSON.parse(this.resource[0].actions[index].value) ? 'Activated' : 'Deactivated';
  }

  onSearchFilters($event: any) {
    const { list, filterName } = $event;
    if (this.listClone && this.listClone.listData) {
      this[this.listClone.listName] = this.listClone.listData;
    }
    const temp = this[filterName];
    this.searchOrigin =
      this.searchLanguage =
      this.searchTerm =
      this.searchCountry =
      this.searchLabels =
      this.searchActionLabels =
        false;

    this[filterName] = !temp;
    this.cd.detectChanges();
    if (this.searchFilterRef && this.searchFilterRef.nativeElement) {
      this.searchFilterRef.nativeElement.focus();
    }
    this.listClone = {
      listName: list,
      listData: JSON.parse(JSON.stringify(this[list]))
    };
  }

  getFiltersList(word: string) {
    if (word.length > 0) {
      return this.listClone.listData.filter((element) => {
        if (element?.label || element?.title) {
          const name = element.label || element.title;
          if (name.toLocaleLowerCase().includes(word)) {
            return element;
          }
        }
      });
    } else {
      return this.listClone.listData.map((element) => element);
    }
  }

  searchInFiltersList($event): void {
    const { event, list } = $event;
    const word = event.target ? event.target.value.toLowerCase() : event;

    switch (list) {
      case 'originList':
        this.originList = this.getFiltersList(word);
        break;
      case 'languageList':
        this.languageList = this.getFiltersList(word);
        break;
      case 'termList':
        this.termList = this.getFiltersList(word);
        break;
      case 'countryList':
        this.countryList = this.getFiltersList(word);
        break;
      case 'hasLabelList':
        this.hasLabelList = this.getFiltersList(word);
        break;
      case 'actionLabelList':
        this.actionLabelList = this.getFiltersList(word);
        break;

      default:
        break;
    }
  }

  private checkError(message) {
    let errMsg = '';
    switch (message) {
      case 'error.exceededLength':
        errMsg = 'The name of the filter is too long';
        break;
      case 'error.bad_format':
        errMsg = 'Domain format is incorrect';
        break;
      case 'error.parse_error':
        errMsg = 'There was an error creating the filter due to an invalid character or regex in the filter phrase';
        break;
      case 'error.invalid_alert_parameters':
        errMsg = 'Alert parameters are invalid';
        break;
      case 'error.filter_already_exists':
        errMsg = 'There is already another filter with that name';
        break;
      default:
        errMsg = 'Something went wrong while saving the filter. Please try again.';
        break;
    }
    this.loading = false;
    this.toastrService.error(errMsg, 'Error');
  }

  openCloseSaveAsModal() {
    this.saveAsModal = !this.saveAsModal;
  }

  canMoveToActionsStep() {
    this.selectedPlugins = this.termsForm.value.plugins.filter((plugin) => plugin.selected);
    this.selectedCountries = this.termsForm.value.countries.filter((country) => country.selected);
    this.selectedLanguages = this.termsForm.value.languages.filter((language) => language.selected);
    this.selectedTerms = this.termsForm.value.terms.filter((term) => term.selected);
    this.selectedLabels = this.termsForm.value.has_label.filter((label) => label.selected);

    if (!this.termsForm.controls.name.valid) {
      return false;
    } else if (this.filterPhrase && this.filterPhrase !== '') {
      return true;
    } else if (this.invalidDomain) {
      return false;
    } else if (this.termsForm.value.domain) {
      return true;
    } else if (this.termsForm.value.extraData.key && this.termsForm.value.extraData.value) {
      return true;
    } else if (this.resource[0].conditions[0].value.length) {
      return true;
    } else if (this.resource[0].conditions[2].value.length) {
      return true;
    } else {
      if (
        this.selectedPlugins.length ||
        this.selectedCountries.length ||
        this.selectedLanguages.length ||
        this.selectedTerms.length ||
        this.selectedLabels.length
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  canMoveToFinalStep() {
    this.selectedActionLabels = this.termsForm.value.label_assignation.filter((label) => label.selected);

    if (this.selectedActionLabels.length) {
      return true;
    } else if (
      this.resource[0].actions[0].value !== '' &&
      this.resource[0].actions[0].value !== 0 &&
      this.resource[0].actions[0].value !== '0'
    ) {
      return true;
    } else if (this.resource[0].actions[1].value === true) {
      return true;
    } else if (this.resource[0].actions[2].value === true) {
      return true;
    } else if (this.resource[0].actions[4].value === true) {
      return true;
    } else if (this.resource[0].actions[5].value !== '') {
      return true;
    } else if (
      this.resource[0].actions[6].value !== '' &&
      this.resource[0].actions[6].value !== 0 &&
      this.resource[0].actions[6].value !== '0'
    ) {
      return true;
    } else {
      return false;
    }
  }

  stepHasChanged(ev) {
    this.currentStep = ev.selectedIndex;
  }

  saveAs(name) {
    this.termsForm.controls['name'].setValue(name);
    this.newMode = true;
    this.editMode = false;
    this.onSubmit();
  }
}
