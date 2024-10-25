import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { debounceTime, filter, finalize, takeUntil } from 'rxjs/operators';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';
import { Subject } from 'rxjs';

type ClassifyType = 'unclassified' | 'employee' | 'customer' | 'extern';
@Component({
  selector: 'app-classify',
  templateUrl: './classify.component.html',
  styleUrls: ['./classify.component.scss']
})
export class ClassifyComponent extends SettingDetailAbstract implements OnInit, OnDestroy {
  pathRegExp = '^([\\w\\d-_]+\\/?)+$'; // for sdf/s-dfre/sdf/
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 27 || event.key === 'Escape') {
      this.isSelectOpen = false;
    }
  }

  @ViewChild('searchDomain') searchDomain: ElementRef;
  isEditing = false;
  selectedUnclassified = {} as any;
  customer: any[];
  employee: any[];
  unclassified: any[];
  extern: any[];
  isSelectOpen = false;
  subdomain: any;
  path: string;
  domain: any;
  initDomains: any[];
  currentTarget: any;
  targetContainer: any;
  displayCollapseEmployee = false;
  displayCollapseCustomer = false;
  displayCollapseExternal = false;
  domains: any[];
  externalTooltip =
    'Set-up your external facing hosts related to your partners or external sites to search in live botnets for account credentials from compromised computers used by your partners or external providers. e.g. partnerportal.mydomain.com || providerportal.mydomain.com';

  searchUnclassified$ = new Subject();
  filteredUnclassified: any[] = [];

  searchEmployee$ = new Subject();
  filteredEmployee: any[] = [];

  searchCustomer$ = new Subject();
  filteredCustomer: any[] = [];

  searchExternal$ = new Subject();
  filteredExternal: any[] = [];

  toggleEmployee() {
    this.displayCollapseEmployee = !this.displayCollapseEmployee;
  }

  toggleCustomer() {
    this.displayCollapseCustomer = !this.displayCollapseCustomer;
  }

  toggleExternal() {
    this.displayCollapseExternal = !this.displayCollapseExternal;
  }

  setSelectedUnclassified(unclassified) {
    this.isEditing = true;
    this.selectedUnclassified = { ...unclassified };
  }

  removeSelectedUnclassified(selectedUnclassified) {
    const newUnclassified = [...this.unclassified];
    this.unclassified = newUnclassified.filter((u) => u.id !== selectedUnclassified.id);
    this.resetSelectedUnclassified();
  }

  editSelectedUnclassified() {
    if (!this.selectedUnclassified?.id) {
      return;
    }
    const index = this.unclassified.findIndex((u) => u.id === this.selectedUnclassified.id);
    if (index !== -1) {
      this.unclassified[index] = { ...this.selectedUnclassified };
      this.resetSelectedUnclassified();
    }
  }

  resetSelectedUnclassified() {
    this.isEditing = false;
    this.selectedUnclassified = {};
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.data?.values) {
      const v = this.data.values[0];
      this.customer = v.CUSTOMER || [];
      this.employee = v.EMPLOYEE || [];
      this.unclassified = v.UNCLASSIFIED || [];
      this.extern = v.EXTERNAL || [];

      this.filteredUnclassified = this.unclassified;
      this.filteredEmployee = this.employee;
      this.filteredCustomer = this.customer;
      this.filteredExternal = this.extern;
    }
    this.classifyService
      .getDomains()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.domains = res;
        this.initDomains = this.domains;
      });

    this.initDebounce('searchUnclassified$', 'filterUnclassified');
    this.initDebounce('searchEmployee$', 'filterEmployee');
    this.initDebounce('searchCustomer$', 'filterCustomer');
    this.initDebounce('searchExternal$', 'filterExternal');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initDebounce(subjectVariable: any, callMethod: any) {
    this[subjectVariable]
      .pipe(
        takeUntil(this.destroy$),
        filter((term: string) => term === '' || term?.length >= 3),
        debounceTime(1500)
      )
      .subscribe((searchText: string) => this[callMethod](searchText));
  }

  debounceSearch(event: any, type: ClassifyType) {
    const { value } = event.target;
    switch (type) {
      case 'unclassified':
        this.searchUnclassified$.next(value);
        break;
      case 'employee':
        this.searchEmployee$.next(value);
        break;
      case 'customer':
        this.searchCustomer$.next(value);
        break;
      case 'extern':
        this.searchExternal$.next(value);
        break;
    }
  }

  filterUnclassified(searchText: string) {
    this.filteredUnclassified = this.unclassified.filter(({ value }: any) => value.includes(searchText));
  }

  filterEmployee(searchText: string) {
    this.filteredEmployee = this.employee.filter(({ value }: any) => value.includes(searchText));
  }

  filterCustomer(searchText: string) {
    this.filteredCustomer = this.customer.filter(({ value }: any) => value.includes(searchText));
  }

  filterExternal(searchText: string) {
    this.filteredExternal = this.extern.filter(({ value }: any) => value.includes(searchText));
  }

  toggleSelect() {
    this.isSelectOpen = !this.isSelectOpen;
    if (this.isSelectOpen && this.searchDomain) {
      this.searchDomain.nativeElement.value = '';
      this.domains = this.initDomains;
    }
  }

  checkUrlIsValid(url: string) {
    return /^(http:\/\/|https:\/\/)?(?!www\b)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
      url
    );
  }

  resetUrlFields() {
    this.subdomain = null;
    this.domain = null;
    this.path = null;
  }

  getDomainAndSubDomain() {
    return this.subdomain ? `${this.subdomain}${!this.subdomain.endsWith('.') ? '.' : ''}${this.domain}` : this.domain;
  }

  getUrlPath(domains: string) {
    const path = this.path ? `/${this.path}` : '';
    return path ? domains.concat(path) : domains;
  }

  validateYourAsset() {
    return this.getUrlPath(this.getDomainAndSubDomain())?.length > 190;
  }

  addNewAsset() {
    if (this.subdomainExists()) {
      this.settings.showError('Duplicated subdomain', this.subdomain + '.' + this.domain, 'error');
      this.subdomain = '';
    } else {
      const domains = this.getDomainAndSubDomain();
      const value = {
        id: '',
        value: domains
      };

      const assetObject = {
        values: [value],
        type: 'DOMAIN'
      };

      const url = this.getUrlPath(domains);
      const isValidUrl = this.checkUrlIsValid(url);
      const subdomainAmount = domains?.split('.').length;
      const hasMultipleSubdomains = subdomainAmount > 3;

      if (isValidUrl) {
        if (hasMultipleSubdomains || this.path) {
          this.targetContainer = 'unclassified';
          this.postElement$({ ...value, value: url }).subscribe(() => this.getAssets());
          if (hasMultipleSubdomains || !this.subdomain) {
            return;
          }
        }

        this.classifyService
          .createNewUnclassified(assetObject)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.resetUrlFields())
          )
          .subscribe(
            () => this.getAssets(),
            (e) => {
              if (e.length > 0) {
                const domainString = e.join('\n');
                this.classifyService.showDomainError(domainString);
              } else {
                this.getAssets();
              }
            }
          );
      } else {
        this.classifyService.showDomainError(`${url}`);
      }
    }
  }

  changeDomain(domain) {
    this.domain = domain;
    this.toggleSelect();
    this.domains = this.initDomains;
    if (this.currentTarget) {
      this.currentTarget = null;
    }
  }

  filterDomains(event) {
    if (event.key === 'Backspace') {
      this.domains = this.initDomains;
    }
    this.currentTarget = event.target;
    const val = event.target.value;
    const newDomains = [];
    this.domains.forEach((d) => {
      if (d.indexOf(val) >= 0) {
        newDomains.push(d);
      }
    });
    this.domains = newDomains;
  }

  getAssets() {
    this.classifyService
      .getDomainAssets()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.unclassified = res.UNCLASSIFIED || [];
        this.filteredUnclassified = this.unclassified;
      });
  }

  getTypeSourceTarget(type: ClassifyType) {
    switch (type) {
      case 'unclassified':
        return this.filteredUnclassified;
      case 'employee':
        return this.filteredEmployee;
      case 'customer':
        return this.filteredCustomer;
      case 'extern':
        return this.filteredExternal;
    }
  }

  onDrop(args) {
    const { target } = args;
    this.targetContainer = target.id;
    const type = this.getTypeSourceTarget(target.id);
    this.addToTarget(args, type);
  }

  addToTarget(args, target) {
    const el = args.el;
    const source = args.source;
    const type = this.getTypeSourceTarget(source.id);
    this.moveElement(el, type, target, source.id);
  }

  moveElement(el, source, target, sourceElement: string) {
    let index = 0;
    source.forEach((it) => {
      if (it.value === el.innerText) {
        if (this.targetContainer !== sourceElement) {
          target.unshift(it);
          source.splice(index, 1);
          this.postElement$(it).subscribe(() => {
            this.toastrService.warning(
              'The changes in the classification will be applied in a maximum time of 24h',
              'Warning'
            );
          });
        }
      } else {
        index += 1;
      }
    });
  }

  postElement$(el) {
    const data = {};
    if (this.targetContainer === 'extern') {
      data['EXTERNAL'] = [el];
    } else {
      data[this.targetContainer.toUpperCase()] = [el];
    }
    return this.classifyService.postNewAsset(data).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.resetUrlFields())
    );
  }

  private subdomainExists() {
    let exists = false;
    const values = [
      ...this.filteredUnclassified,
      ...this.filteredCustomer,
      ...this.filteredEmployee,
      ...this.filteredExternal
    ];
    exists = values.findIndex((item) => item.value === this.subdomain + '.' + this.domain) !== -1;
    return exists;
  }
}
