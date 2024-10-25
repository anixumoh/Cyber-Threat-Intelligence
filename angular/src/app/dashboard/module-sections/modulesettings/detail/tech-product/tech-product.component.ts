import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';
import * as _ from 'lodash';
@Component({
  selector: 'app-tech-product',
  templateUrl: './tech-product.component.html',
  styleUrls: ['./tech-product.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class TechProductComponent extends SettingDetailAbstract implements OnInit {
  isSelectOpenPartner = false;
  isSelectOpenProducts = false;
  product: any;
  partner: any;
  allPartners: any[];
  allProducts: any[];
  selectedPartner: any;
  sendProducts: any[];
  buttonDisabled = false;
  partnersToFilter;
  productToFilter;
  inputProduct = '';
  isShowInfo = false;

  @ViewChild('dropdownPartners', { read: ElementRef }) dropdownPartners: ElementRef;
  @ViewChild('dropdownPartnersInput', { read: ElementRef }) dropdownPartnersInput: ElementRef;
  @ViewChild('dropdownPartnersButton', { read: ElementRef }) dropdownPartnersButton: ElementRef;
  @ViewChild('dropdownProducts', { read: ElementRef }) dropdownProducts: ElementRef;

  ngOnInit() {
    super.ngOnInit();
    this.techProductService
      .getInitialTechProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((initialtech) => {
        this.values = initialtech.values;
      });

    this.techProductService
      .getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.allPartners = res;
        this.partnersToFilter = res;
      });
  }

  onClickOutside(event) {
    if (
      this.isSelectOpenPartner &&
      this.dropdownPartners &&
      this.dropdownPartnersButton &&
      this.dropdownPartnersInput &&
      !this.dropdownPartners.nativeElement.contains(event.target) &&
      !this.dropdownPartnersButton.nativeElement.contains(event.target) &&
      !this.dropdownPartnersInput.nativeElement.contains(event.target)
    ) {
      this.toggleSelectPartner();
    }

    if (
      this.isSelectOpenProducts &&
      this.dropdownProducts &&
      !this.dropdownProducts.nativeElement.contains(event.target)
    ) {
      this.toggleSelectProducts();
    }
  }

  toggleSelectPartner() {
    this.isSelectOpenPartner = !this.isSelectOpenPartner;
    this.sendProducts = [];
  }

  selectPartner(partner) {
    this.partner = partner.label;
    this.toggleSelectPartner();
  }

  selectProduct(product) {
    this.product = product.title;
    this.toggleSelectProducts();
  }

  toggleSelectProducts() {
    this.isSelectOpenProducts = !this.isSelectOpenProducts;
    if (this.isSelectOpenProducts) {
      this.techProductService
        .getProductsByCompany(this.partner)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.allProducts = res;
          this.productToFilter = res;
        });
      this.buttonDisabled = true;
    } else {
      this.buttonDisabled = false;
    }
  }

  searchInPartners(event) {
    let word;
    word = event.target.value.toLowerCase();
    if (word.length > 0) {
      let temp;
      temp = [];
      this.allPartners.forEach((partner) => {
        if (partner.value.toLowerCase().indexOf(word) >= 0) {
          temp.push(partner);
        }
      });
      this.allPartners = temp;
    } else {
      this.allPartners = this.partnersToFilter;
    }
  }

  searchInProducts(event) {
    let word = event.target.value.trim().toLowerCase();
    if (word.length > 0) {
      let temp;
      temp = [];
      this.allProducts.forEach((product) => {
        if (product.title.toLowerCase().indexOf(word) >= 0) {
          temp.push(product);
        }
      });
      this.allProducts = temp;
    } else {
      this.allProducts = this.productToFilter;
    }
  }

  addDataProduct() {
    let remaining, sendObject, partner_product;
    partner_product = !this.product ? { value: `${this.partner}` } : { value: `${this.partner}`, id: this.product.id };
    sendObject = { values: [partner_product], type: 'TECH_PRODUCT' };
    this.techProductService
      .postNewTechCompany(sendObject)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.values.push(partner_product);
      });
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }
}
