import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { switchMap, takeUntil, filter, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CustomerService } from './customer.service';
import { ServerList } from 'app/shared/cs/server-list';
import { CustomerCreateEditComponent } from './create-edit-detail/create-edit-customer.component';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent extends ServerList implements OnInit, OnDestroy {
  @ViewChild('createEditCustomerComponent') createEditCustomerComponent: CustomerCreateEditComponent;
  loading = false;
  loadingDetails = false;
  items = [];
  loadingCreateEdit = false;
  loadingDelete = false;
  isModalOpen = false;
  isDeleteConfirmationOpen = false;
  customerToDelete = null;
  modalType = '';
  selectedItem = null;
  contractedModules;
  bands;
  types;
  customerQuery: any;
  searchedText = '';
  initMaxRows: any;
  noData = false;

  constructor(
    private customerService: CustomerService,
    private toastrService: ToastrService,
    private userAccountService: UserAccountService
  ) {
    super();
    this.order = {
      name: 'name',
      customerType: 'customerType',
      includingSubdomains: 'includingSubdomains'
    };
    this.customerService
      .getCustomerTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.types = res;
      });
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.initMaxRows = state && state.defaultRows ? state.defaultRows : this.limits[0].value;
        this.reloadData(true, this.initMaxRows);
      });
    this.searchFilter$
      .pipe(
        takeUntil(this.destroy$),
        filter((term) => term === '' || term.length >= 3),
        debounceTime(1500),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        if (searchTerm !== 'null') {
          this.customerQuery = searchTerm;
          this.reloadData(true);
        }
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  reloadData(firstPage = false, initMaxRows?: any) {
    this.loading = true;
    if (initMaxRows) {
      this.limit = initMaxRows;
    }
    this.page = firstPage ? 0 : this.page;
    const params: any = {
      p: true,
      page: firstPage ? 1 : this.page + 1,
      size: this.limit,
      q: this.customerQuery,
      ...(this.orderBy.key ? { sort: `${this.orderBy.key},${this.orderBy.direction ? 'desc' : 'asc'}` } : {})
    };

    this.customerService
      .getAllCustomers(params, this.customerQuery)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        (res) => {
          this.items = res['content'];
          this.count = res['totalElements'];
        },
        () => {
          this.noData = true;
        }
      );
  }

  getNonDeletedModules({ customerModules }) {
    return !!customerModules?.length ? customerModules.filter((mod) => !mod.deleted) : customerModules;
  }

  getBands() {
    this.customerService
      .getBands()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.bands = res;
      });
  }

  openModal(type, id?) {
    this.selectedItem = null;
    this.loadingDetails = true;
    this.isModalOpen = !this.isModalOpen;
    this.contractedModules = [];
    this.modalType = type;

    if (this.isModalOpen) {
      this.getBands();
      if (id) {
        this.customerService
          .getCustomerDetails(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            this.selectedItem = {
              ...res,
              customerModules: this.getNonDeletedModules(res)
            };
            this.loadingDetails = false;
          });
      } else {
        this.loadingDetails = false;
      }
    }
  }

  createEditCustomer(e) {
    const modules = [];
    e.modules.forEach((mod) => {
      modules.push({ moduleType: mod });
    });

    const customer = {
      active: e.active,
      enforcing: e.enforcing,
      customerTypeId: e.customerTypeId,
      name: e.name
    };

    const contract = {
      bandId: e.band,
      bandValues: e.modifiedBand ? e.bandValues : null,
      contractsModules: modules,
      endAt: e.to,
      isBincodes: e.isBincodes,
      startAt: e.since
    };

    const invoicing = e.invoicing;

    if (this.modalType === 'create') {
      this.customerService
        .createCustomer(customer)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            return this.customerService.createCustomerContract(contract, res['id']);
          })
        )
        .subscribe(
          () => {
            this.reloadData();
            this.isModalOpen = false;
          },
          () => {
            this.toastrService.error(
              'There was a problem while creating the customer, please try again later',
              'Error'
            );
          }
        );
    } else if (this.selectedItem.contract) {
      this.customerService
        .editCustomer(customer, this.selectedItem.id)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            return this.customerService.editCustomerContract(contract, res['id']);
          })
        )
        .subscribe(
          () => {
            this.reloadData();
            this.isModalOpen = false;
          },
          () => {
            this.toastrService.error('There was a problem while editing the customer, please try again later', 'Error');
          }
        );
      if (invoicing.length) {
        invoicing.forEach((mod) => {
          const data = {
            invoicing: mod.invoicing
          };
          this.customerService
            .editInvoicing(this.selectedItem.id, mod.id, data)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {},
              () => {
                this.toastrService.error(
                  'There was a problem while editing the invoicing for some of the modules, please try again later',
                  'Error'
                );
              }
            );
        });
      }
    } else {
      this.customerService
        .editCustomer(customer, this.selectedItem.id)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            return this.customerService.createCustomerContract(contract, res['id']);
          })
        )
        .subscribe(
          () => {
            this.reloadData();
            this.isModalOpen = false;
          },
          () => {
            this.toastrService.error('There was a problem while editing the customer, please try again later', 'Error');
          }
        );
      if (invoicing.length) {
        invoicing.forEach((mod) => {
          const data = {
            invoicing: mod.invoicing
          };
          this.customerService
            .editInvoicing(this.selectedItem.id, mod.id, data)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {},
              () => {
                this.toastrService.error(
                  'There was a problem while editing the invoicing for some of the modules, please try again later',
                  'Error'
                );
              }
            );
        });
      }
    }
  }

  createEditBand(e) {
    const data = {
      name: e.data.name,
      bandValues: {
        binCodes: e.data.binCodes,
        creditCardsPerYear: e.data.creditCardsPerYear,
        employees: e.data.employees,
        ips: e.data.ips,
        keywords: e.data.keywords,
        rootDomains: e.data.rootDomains,
        storage: e.data.storage,
        cpes: e.data.cpes
      }
    };

    switch (e.type) {
      case 'create':
        this.customerService
          .createBand(data)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.bands.push(res);
            this.createEditCustomerComponent.closeCreateEditBand();
          });
        break;
      case 'edit':
        this.customerService
          .editBand(data, e.data.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.getBands();
            this.createEditCustomerComponent.closeCreateEditBand();
          });
        break;
    }
  }

  isContractExpired(item) {
    const date = new Date(item.contract.endAt);
    const today = new Date();
    return date < today;
  }

  openDeleteModal(item) {
    this.customerToDelete = item;
    this.isDeleteConfirmationOpen = true;
  }

  deleteCustomer(id) {
    this.loadingDelete = true;
    this.customerService
      .deleteCustomer(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.loadingDelete = false;
          this.reloadData();
        },
        () => {
          this.toastrService.error('There was a problem while deleting the customer, please try again later', 'Error');
        }
      );
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  setOrder(resource: any) {
    this.setOrderBy(resource);
    this.reloadData();
  }
}
