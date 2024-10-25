import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-create-edit-customer',
  templateUrl: './create-edit-customer.component.html',
  styleUrls: ['./create-edit-customer.component.scss']
})
export class CustomerCreateEditComponent implements OnDestroy {
  loading = false;
  items = [];
  isButtonLoading = false;
  customerForm: UntypedFormGroup;
  contractedModules = [];
  isDateOpen = false;

  bandForm: UntypedFormGroup;
  isBandModalOpen = false;
  bandMode = '';
  isBandConfirmationOpen = false;
  isBandConfirmationLoading = false;
  showResetButton = false;
  hasModifiedBand = false;
  modifiedBandValues = null;
  customBandId;
  bandInfo;
  canSaveBand = false;
  bandRows = [
    { value: 'binCodes', name: 'BINCODES' },
    { value: 'creditCardsPerYear', name: 'CREDIT CARDS' },
    { value: 'employees', name: 'EMPLOYEES' },
    { value: 'ips', name: 'IPs' },
    { value: 'keywords', name: 'KEYWORDS' },
    { value: 'rootDomains', name: 'DOMAINS' },
    { value: 'emails', name: 'E-MAILS' },
    { value: 'cpes', name: 'CPES' },
    { value: 'storage', name: 'STORAGE' }
  ];

  moduleTypes = [
    { type: 'CUSTOM', name: 'Custom' },
    { type: 'DOMAIN_PROTECTION', name: 'Domain Protection' },
    { type: 'CREDIT_CARDS', name: 'Credit Cards' },
    { type: 'MOBILE_APPS', name: 'Mobile Apps' },
    { type: 'CREDENTIALS', name: 'Credentials' },
    { type: 'DATA_LEAKAGE', name: 'Data Leakage' },
    { type: 'SOCIAL_MEDIA', name: 'Social Media' },
    { type: 'HACKTIVISM', name: 'Hacktivism' },
    { type: 'MEDIA_TRACKER', name: 'Media Tracker' },
    { type: 'DARK_WEB', name: 'Dark Web' },
    { type: 'EXPLORER', name: 'Explorer' },
    { type: 'THREAT_CONTEXT', name: 'Threat Context' }
  ];

  moduleDictionary = {
    CUSTOM: 'Custom',
    DOMAIN_PROTECTION: 'Domain Protection',
    CREDIT_CARDS: 'Credit Cards',
    MOBILE_APPS: 'Mobile Apps',
    MALWARE: 'Malware',
    CREDENTIALS: 'Credentials',
    DATA_LEAKAGE: 'Data Leakage',
    SOCIAL_MEDIA: 'Social Media',
    HACKTIVISM: 'Hacktivism',
    MEDIA_TRACKER: 'Media Tracker',
    DARK_WEB: 'Dark Web',
    EXPLORER: 'Explorer',
    THREAT_CONTEXT: 'Threat Context'
  };

  modulesTable = [];

  invoicingModules = [];

  _type;
  @Input()
  set type(its) {
    this._type = its;
  }

  get type() {
    return this._type;
  }

  _loadingDetails;
  @Input()
  set loadingDetails(its) {
    this._loadingDetails = its;
  }

  get loadingDetails() {
    return this._loadingDetails;
  }

  _data;
  @Input()
  set data(its) {
    this._data = its;
    this.loading = true;
    this.initForm();
  }

  get data() {
    return this._data;
  }

  _customerTypes;
  @Input()
  set customerTypes(its) {
    this._customerTypes = its;
  }

  get customerTypes() {
    return this._customerTypes;
  }

  _bands;
  @Input()
  set bands(its) {
    this._bands = its;
  }

  get bands() {
    return this._bands;
  }

  _selectedItem;
  @Input()
  set selectedItem(its) {
    this._selectedItem = its;
  }

  get selectedItem() {
    return this._selectedItem;
  }

  _isOpen;
  @Input()
  set isOpen(its) {
    this._isOpen = its;
  }

  get isOpen() {
    return this._isOpen;
  }

  @Output() closeModal = new EventEmitter();
  @Output() createEditCustomer = new EventEmitter();
  @Output() createEditBand = new EventEmitter();

  constructor() {}

  ngOnDestroy() {
    this.customerForm.reset();
    this.bandForm.reset();
  }

  initForm() {
    this.hasModifiedBand = this.data && this.data.contract && this.data.contract.bandValues;
    this.modifiedBandValues =
      this.data && this.data.contract && this.data.contract.bandValues ? this.data.contract.bandValues : null;
    this.customBandId =
      this.hasModifiedBand && this.data && this.data.contract && this.data.contract.band
        ? this.data.contract.band.id
        : null;

    if (this.data && this.data.contract && this.data.contract.contractsModules) {
      const mods = [];
      this.data.contract.contractsModules.forEach((item) => {
        mods.push(item.moduleType);
      });
      this.contractedModules = mods;
    }

    this.customerForm = new UntypedFormGroup({
      name: new UntypedFormControl(
        { value: this.data && this.data.name ? this.data.name : '', disabled: this.type === 'details' },
        [Validators.required, Validators.pattern('[^]{3,70}')]
      ),
      customerTypeId: new UntypedFormControl(
        {
          value: this.data && this.data.customerTypeId ? this.data.customerTypeId : '',
          disabled: this.type === 'details'
        },
        Validators.required
      ),
      isBincodes: new UntypedFormControl(
        {
          value: this.data && this.data.contract ? this.data.contract.isBincodes : true,
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      since: new UntypedFormControl(
        {
          value:
            this.data && this.data.contract && this.data.contract.startAt
              ? this.data.contract.startAt
              : this.getSince(),
          disabled: this.type === 'details'
        },
        Validators.required
      ),
      to: new UntypedFormControl(
        {
          value: this.data && this.data.contract && this.data.contract.endAt ? this.data.contract.endAt : this.getTo(),
          disabled: this.type === 'details'
        },
        Validators.required
      ),
      band: new UntypedFormControl(
        { value: this.data && this.data.contract ? this.data.contract.band.id : '', disabled: this.type === 'details' },
        Validators.required
      ),
      active: new UntypedFormControl(
        { value: this.data && this.data.active ? this.data.active : true, disabled: this.type === 'details' },
        Validators.required
      ),
      enforcing: new UntypedFormControl(
        { value: this.data && this.data.enforcing ? this.data.enforcing : false, disabled: this.type === 'details' },
        Validators.required
      ),
      modules: new UntypedFormControl(
        { value: this.contractedModules, disabled: this.type === 'details' },
        Validators.required
      )
    });
    this.initBandForm();

    if (this.data && this.data.customerModules) {
      const mods = this.data.customerModules;
      const contractedModules =
        this.data.contract && this.data.contract.contractsModules ? this.data.contract.contractsModules : [];
      const table = [];
      const types = [];

      mods.forEach((mod) => {
        const obj = {
          link: this.getModuleLink(mod.link),
          id: mod.id,
          invoicing: mod.invoicing,
          deleted: mod.deleted,
          trial: mod.trial,
          moduleType: mod.moduleType,
          domains: mod.moduleValues ? mod.moduleValues.rootDomains : null,
          ip: mod.moduleValues ? mod.moduleValues.ips : null,
          keywords: mod.moduleValues ? mod.moduleValues.keywords : null,
          binCodes: mod.moduleValues ? mod.moduleValues.binCodes : null,
          emails: mod.moduleValues ? mod.moduleValues.emails : null,
          creditCardsPerYear: mod.moduleValues ? mod.moduleValues.creditCardsPerYear : null,
          storage: mod.moduleValues ? mod.moduleValues.storage : null,
          cpes: mod.moduleValues ? mod.moduleValues.cpes : null
        };

        const modTypeIndex = types.indexOf(mod.moduleType.toLowerCase());
        if (modTypeIndex === -1) {
          const obj2 = { show: true, ...obj };
          const moduleTypeTotalsIndex = contractedModules
            .map((e) => {
              return e.moduleType;
            })
            .indexOf(mod.moduleType);

          const moduleTotals = contractedModules[moduleTypeTotalsIndex]
            ? contractedModules[moduleTypeTotalsIndex]
            : null;
          table.push({ moduleType: mod.moduleType, modules: [obj2], total: moduleTotals });

          types.push(mod.moduleType.toLowerCase());
        } else {
          table[modTypeIndex].modules.push({ ...obj, show: false });
        }
      });
      this.modulesTable = table;
    }
    this.loading = false;
  }

  isContractedModule(type) {
    const modules = this.customerForm.controls['modules'].value;
    const index = modules.findIndex((customerMod) => customerMod.toLowerCase() === type.toLowerCase());
    return index > -1;
  }

  getModuleLink(link) {
    const noHttp = link.replace('https://', '');
    const values = noHttp.split('/');
    return `https://${values[0]}/dashboard/organizations/${values[4]}/modules/${values[6]}`;
  }

  formatDate(d) {
    if (d) {
      const split = d.split('-');
      return split[2] + '.' + split[1] + '.' + split[0];
    }
  }

  getSince() {
    if (this.type === 'create') {
      const today = new Date();
      return (
        today.getUTCFullYear() +
        '-' +
        ('0' + (today.getUTCMonth() + 1)).slice(-2) +
        '-' +
        ('0' + today.getUTCDate()).slice(-2)
      );
    } else {
      return null;
    }
  }

  getTo() {
    if (this.type === 'create') {
      const today = new Date();
      return (
        today.getUTCFullYear() +
        1 +
        '-' +
        ('0' + (today.getUTCMonth() + 1)).slice(-2) +
        '-' +
        ('0' + today.getUTCDate()).slice(-2)
      );
    } else {
      return null;
    }
  }

  cancelCreateEdit() {
    this.closeModal.emit();
  }

  changeType(e) {
    this.customerForm.controls.customerTypeId.setValue(e.target.value);
  }

  changeBand(e) {
    this.customerForm.controls.band.setValue(e.target.value);
    this.hasModifiedBand = this.customBandId && e.target.value.toString() === this.customBandId.toString();
    this.initBandForm();
  }

  createEdit() {
    this.customerForm.controls['name'].markAsDirty();
    this.customerForm.controls['customerTypeId'].markAsDirty();
    this.customerForm.controls['since'].markAsDirty();
    this.customerForm.controls['to'].markAsDirty();
    this.customerForm.controls['modules'].markAsDirty();
    this.customerForm.controls['band'].markAsDirty();
    this.customerForm.controls['active'].markAsDirty();

    if (this.customerForm.valid) {
      const data = {
        ...this.customerForm.getRawValue(),
        modifiedBand: this.hasModifiedBand,
        bandValues: this.bandForm.getRawValue(),
        invoicing: this.invoicingModules
      };
      this.createEditCustomer.emit(data);
    }
  }

  initBandForm() {
    this.canSaveBand = false;
    this.showResetButton = false;
    const bandId = this.customerForm.getRawValue().band;
    const bandDetails = this.bands ? this.bands.filter((x) => x.id.toString() === bandId.toString()) : null;

    if (
      this.hasModifiedBand &&
      this.customBandId &&
      bandId.toString() === this.customBandId.toString() &&
      bandDetails
    ) {
      this.showResetButton = true;
      this.bandInfo = { name: bandDetails[0].name, id: bandDetails[0].id, bandValues: this.modifiedBandValues };
    } else {
      this.bandInfo = bandDetails ? bandDetails[0] : null;
    }

    this.bandForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.bandInfo && this.bandInfo.id ? this.bandInfo.id : '', [Validators.required]),

      name: new UntypedFormControl(
        { value: this.bandInfo && this.bandInfo.name ? this.bandInfo.name : '', disabled: true },
        [Validators.required]
      ),
      binCodes: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.binCodes
              ? this.bandInfo.bandValues.binCodes
              : '',
          disabled: !this.customerForm.controls['isBincodes'].value || this.type === 'details'
        },
        [Validators.required]
      ),
      creditCardsPerYear: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.creditCardsPerYear
              ? this.bandInfo.bandValues.creditCardsPerYear
              : '',
          disabled: this.customerForm.controls['isBincodes'].value || this.type === 'details'
        },
        [Validators.required]
      ),
      employees: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.employees
              ? this.bandInfo.bandValues.employees
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      ips: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.ips
              ? this.bandInfo.bandValues.ips
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      keywords: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.keywords
              ? this.bandInfo.bandValues.keywords
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      rootDomains: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.rootDomains
              ? this.bandInfo.bandValues.rootDomains
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      emails: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.emails
              ? this.bandInfo.bandValues.emails
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      storage: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.storage
              ? this.bandInfo.bandValues.storage
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      ),
      cpes: new UntypedFormControl(
        {
          value:
            this.bandInfo && this.bandInfo.bandValues && this.bandInfo.bandValues.cpes
              ? this.bandInfo.bandValues.cpes
              : '',
          disabled: this.type === 'details'
        },
        [Validators.required]
      )
    });
  }

  openEditBand(mode) {
    this.bandMode = mode;
    this.isBandModalOpen = true;
  }

  createEditCustomerBand() {
    const data = this.bandForm.getRawValue();
    if (this.bandForm.dirty) {
      this.hasModifiedBand = true;
      this.customBandId = data.id;
      this.modifiedBandValues = {
        binCodes: data.binCodes,
        creditCardsPerYear: data.creditCardsPerYear,
        employees: data.employees,
        ips: data.ips,
        keywords: data.keywords,
        rootDomains: data.rootDomains,
        emails: data.emails,
        storage: data.storage,
        cpes: data.cpes
      };
    } else {
      this.hasModifiedBand = false;
      this.customBandId = null;
      this.modifiedBandValues = null;
    }
    this.isBandConfirmationOpen = false;
    this.isBandModalOpen = false;
  }

  cancelCreateEditBand() {
    this.hasModifiedBand = this.modifiedBandValues ? true : false;
    this.isBandModalOpen = false;
  }

  resetBandValues() {
    this.hasModifiedBand = false;
    this.initBandForm();
    this.canSaveBand = true;
  }

  confirmCreateEditBand() {
    this.isBandConfirmationOpen = true;
  }

  closeCreateEditBand() {
    this.isBandConfirmationLoading = false;
    this.isBandConfirmationOpen = false;
    this.isBandModalOpen = false;
  }

  getTitle() {
    switch (this.type) {
      case 'create':
        return 'Create Customer';
      case 'edit':
        return 'Edit Customer';
      case 'details':
        return 'Customer Details';
    }
  }

  openCloseDate() {
    this.isDateOpen = !this.isDateOpen;
  }

  indexTypes(type) {
    return this.customerForm.controls['modules'].value.indexOf(type);
  }

  changeModules(e) {
    if (this.type !== 'details') {
      const modules = this.customerForm.controls['modules'].value;
      const modIndex = modules.indexOf(e);

      if (modIndex > -1) {
        modules.splice(modIndex, 1);

        const explorerIndex = e === 'THREAT_CONTEXT' ? modules.indexOf('EXPLORER') : -1;
        if (e === 'THREAT_CONTEXT' && explorerIndex > -1) {
          modules.splice(explorerIndex, 1);
        }
      } else {
        modules.push(e);

        if (e === 'THREAT_CONTEXT') {
          modules.push('EXPLORER');
        }
      }

      this.customerForm.controls['modules'].setValue(modules);
    }
  }

  selectAllModules() {
    if (this.type !== 'details') {
      const mods = [];
      this.moduleTypes.forEach((mod) => {
        mods.push(mod.type);
      });
      this.customerForm.controls['modules'].setValue(mods);
    }
  }

  changeBincodes(value) {
    this.customerForm.controls['isBincodes'].setValue(value);
    this.initBandForm();
  }

  hasCreditCardModule() {
    const mods = this.customerForm.controls['modules'].value;
    const index = mods.indexOf('CREDIT_CARDS');
    return index > -1;
  }

  editMode() {
    this.type = 'edit';
    this.initForm();
  }

  changeInvoicing(e, id) {
    const dictionary = { yes: true, no: false };
    const index = this.invoicingModules.findIndex((item) => item.id === id);

    if (index > -1) {
      this.invoicingModules[index].invoicing = dictionary[e.target.value];
    } else {
      const obj = {
        id,
        invoicing: dictionary[e.target.value]
      };
      this.invoicingModules.push(obj);
    }
  }
}
