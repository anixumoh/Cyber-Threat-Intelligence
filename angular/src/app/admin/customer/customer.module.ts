import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { CustomerComponent } from './customer.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomerService } from './customer.service';
import { CustomerCreateEditComponent } from './create-edit-detail/create-edit-customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '../../dashboard/module-sections/shared/modal/modal.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedAdminModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,
  },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        CommonModule,
        NgbModule,
        TypeaheadModule.forRoot(),
        FormsModule,
        ModalModule,
        ReactiveFormsModule,
        SharedAdminModule,
    ],
    declarations: [CustomerComponent, CustomerCreateEditComponent],
    providers: [CustomerService]
})
export class CustomerModule {}
