import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { of as observableOf, Subject } from 'rxjs';
import { take, takeUntil, catchError, switchMap, debounceTime } from 'rxjs/operators';

import { TechProductService } from './tech-product.service';
import { Grants } from '../../../../../../../services/grants/grants';
import { ToastrService } from 'ngx-toastr';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Component({
  selector: 'app-tech-product',
  templateUrl: './tech-product.component.html',
  styleUrls: ['./tech-product.component.scss'],
  providers: [TechProductService]
})
export class TechProductComponent implements OnInit, OnDestroy {
  @ViewChild('inputAll', { read: ElementRef }) inputAll: ElementRef;
  @ViewChild('dropDownUser') dropDownUser: ElementRef;
  @ViewChild('dropDownButtonUser') dropDownButtonUser: ElementRef;

  @Input() set parameter(config) {
    this.config = config;
  }

  config: any;
  items: any[] = [];
  companies: any[] = [];
  company: any = null;
  products: any[] = [];
  product: any = null;
  versions: any[] = [];
  version: any = null;
  searchText = '';
  productLoaded = false;
  versionLoaded = false;
  isAdding = false;
  all = false;
  deleteConfirmation = false;
  deleteAllConfirmation = false;
  techIndex = null;
  isMenuAlertOpened = false;
  searchVendor = '';
  searchProduct = '';
  searchVersion = '';
  isVendorDropdownOpen = false;
  isProductDropdownOpen = false;
  isVersionDropdownOpen = false;
  includeDeprecated = false;
  loadingVendors = false;
  loadingProducts = false;
  loadingVersions = false;
  searchVendor$ = new Subject<string>();
  cveImportModal = false;
  cpeError = [];
  currentModule;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private techProductService: TechProductService,
    public grants: Grants,
    private toastrService: ToastrService,
    private moduleSettingsDetailService: ModuleSettingsDetailService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.organizationService.getCurrentContext().pipe(takeUntil(this.destroy$)).subscribe(context => {
      this.currentModule = context.currentModule;
      this.getItems();
      this.subscribeToSearchCompanies();
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToSearchCompanies() {
    this.searchVendor$
      .pipe(
        debounceTime(1500),
        switchMap((searchVendor) => this.techProductService.getCompanies(searchVendor)),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.companies = response || [];
        this.loadingVendors = false;
      });
  }

  getItems() {
    this.techProductService
      .getInitialTechProducts()
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        catchError(() => observableOf([]))
      )
      .subscribe((data) => {
        this.items = data.values;
      });
  }

  toogleAdding() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      this.resetAdding();
    }
  }

  searchCompany() {
    this.isProductDropdownOpen = false;
    this.products = [];
    this.searchProduct = '';
    if (this.searchVendor) {
      this.companies = [];
      this.loadingVendors = true;
      this.isVendorDropdownOpen = true;
      this.searchVendor$.next(this.searchVendor);
    } else {
      this.isVendorDropdownOpen = false;
      this.company = null;
      this.product = null;
      this.companies = [];
    }
  }

  searchProducts() {
    if (this.searchProduct) {
      this.loadingProducts = true;
      this.isProductDropdownOpen = true;
      this.getProducts(this.company.value);
    } else {
      this.product = null;
      this.products = [];
      this.isProductDropdownOpen = false;
    }
  }

  searchVersions() {
    if (this.searchVersion) {
      this.loadingVersions = true;
      this.isVersionDropdownOpen = true;
      this.getVersions(this.product.value);
    } else {
      this.version = null;
      this.versions = [];
      this.isVersionDropdownOpen = false;
    }
  }

  resetAdding() {
    this.searchVendor = '';
    this.searchProduct = '';
    this.isAdding = false;
    this.company = null;
    this.products = [];
    this.product = null;
    this.productLoaded = false;
    this.isVendorDropdownOpen = false;
  }

  companyChange(event) {
    this.searchVendor = event.label;
    this.productLoaded = false;
    this.company = event;
    if (!this.company) {
      this.company = null;
    }
    this.products = [];
    this.product = null;
    this.version = null;
    this.versions = [];
    this.searchProduct = '';
    this.searchVersion = '';
    this.isVendorDropdownOpen = false;
    this.isVersionDropdownOpen = false;
  }

  productChange(event) {
    this.product = event || null;
    this.searchProduct = event.label;
    this.isProductDropdownOpen = false;
    this.version = null;
    this.searchVersion = '';
    this.isVersionDropdownOpen = false;
  }

  versionChange(event) {
    this.version = event || null;
    this.searchVersion = event.title;
    this.isVersionDropdownOpen = false;
  }

  selectCompany(company) {
    this.getProducts(company);
  }

  changeDeprecated() {
    if (this.company && this.product && this.searchVersion) {
      this.loadingVersions = true;
      this.getVersions(this.product.value);
    }
  }

  getProducts(company) {
    this.techProductService
      .getProductsByCompany(company, this.includeDeprecated, this.searchProduct)
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((response) => {
        this.products = response;
        this.loadingProducts = false;
        setTimeout(() => (this.productLoaded = true));
      });
  }

  getVersions(product) {
    this.techProductService
      .getProductVersions(product, this.company.value, this.searchVersion, this.includeDeprecated)
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(
        (response) => {
          this.versions = response;
          this.loadingVersions = false;
          setTimeout(() => (this.versionLoaded = true));
        },
        () => {
          this.isVersionDropdownOpen = false;
        }
      );
  }

  store() {
    const type = 'CPE_TECH';
    let values: any[] = [];
    const duplicated: any[] = [];

    if (this.company && this.product && this.version) {
      values = [
        {
          version: this.version.cpeName,
          title: this.version.title
        }
      ];
    } else if (this.company && this.product && !this.version) {
      const index = this.items.findIndex((x) => x.value === this.product.value);
      if (index > -1) {
        duplicated.push(this.product.value);
        const message = `The following product is duplicated and was not added: ${this.product.label}`;
        this.toastrService.error(message, 'Error');
      }

      values = [
        {
          vendor: this.company.value,
          product: this.product.value,
          title: this.product.label
        }
      ];
    } else if (this.company && !this.product && !this.version) {
      const index = this.items.findIndex((x) => x.value === this.company.value);
      if (index > -1) {
        duplicated.push(this.company.value);
        const message = `The following company is duplicated and was not added: ${this.company.value}`;
        this.toastrService.error(message, 'Error');
      }

      values = [
        {
          vendor: this.company.value,
          title: this.company.label
        }
      ];
    }

    if (!duplicated.length) {
      this.techProductService
        .update({ type, values })
        .pipe(takeUntil(this.destroy$), take(1))
        .subscribe(
          () => {
            this.resetAdding();
            this.getItems();
          },
          (e) => {
            switch (e.status) {
              case 412:
                this.moduleSettingsDetailService.showError(e.error.field, '', 'error');
                break;

              default:
                this.moduleSettingsDetailService.showError('Invalid and not added', '', 'error');
                break;
            }
          }
        );
    }
  }

  delete(values) {
    const type = 'CPE_TECH';
    this.techProductService
      .delete({ type, values })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((response) => {
        const { httpCode } = response;
        if (+httpCode === 200) {
          this.items = this.items.filter((item) => {
            const toDelete = values.find((value) => item.cpe === value.cpe);
            return !toDelete;
          });
          this.onSelectChange();
        }
      });

    this.deleteAllConfirmation = false;
    this.deleteConfirmation = false;
    this.techIndex = null;
  }

  deleteAll() {
    const values = this.items.filter((item) => item.selected).map((item) => ({ title: item.title, cpe: item.cpe }));
    this.delete(values);
    this.deleteAllConfirmation = false;
    this.deleteConfirmation = false;
    this.searchText = '';
    this.all = false;
  }

  importCpes(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('file', file);
      this.techProductService.importCpes(formData).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.getItems()
      }, e => {
        this.getItems()
        if (e.length) {
          this.cpeError = e;
          this.cveImportModal = true;
        } else {
          const errorType = e.error && e.error.message ? e.error.message : '';
    
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
    
            default:
              this.toastrService.error('An error has occured. Cpes not added', 'Error');
              break;
          }
        }
      })
    }
  }

  selectAll() {
    for (const item of this.items) {
      item.selected = this.all;
    }
  }

  unselectAll() {
    for (const item of this.items) {
      item.selected = false;
    }
  }

  onSelectChange() {
    if (this.items.length === 0) {
      return (this.all = false);
    }
    const every = this.items.every((item) => item.selected);
    if (every) {
      this.all = true;
    } else {
      const none = this.items.some((item) => !item.selected);
      if (none) {
        this.all = false;
      }
    }
  }

  isSomeItemSelected() {
    return this.items.some((item) => item.selected);
  }

  onClickOutside(event) {
    if (this.checkDropDown(event.target) && this.checkDropDownButton(event.target)) {
      this.isMenuAlertOpened = false;
    }
  }

  openConfirmationModal(value) {
    this.deleteConfirmation = true;
    this.techIndex = value;
  }

  closeConfirmation() {
    this.deleteConfirmation = false;
    this.deleteAllConfirmation = false;
    this.techIndex = null;
    this.unselectAll();
    this.searchText = '';
    this.all = false;
  }

  openDeleteAllConfirmationModal() {
    this.deleteAllConfirmation = true;
  }

  private checkDropDown(target) {
    return this.dropDownUser && this.dropDownUser.nativeElement && !this.dropDownUser.nativeElement.contains(target);
  }

  private checkDropDownButton(target) {
    return (
      this.dropDownButtonUser &&
      this.dropDownButtonUser.nativeElement &&
      !this.dropDownButtonUser.nativeElement.contains(target)
    );
  }
}
