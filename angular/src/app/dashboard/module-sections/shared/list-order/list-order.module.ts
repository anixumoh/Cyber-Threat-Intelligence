import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { listOrderComponent } from './list-order.component';
import { listOrderService } from './list-order.service';

@NgModule({
  imports: [NgbModule, CommonModule],
  declarations: [listOrderComponent],
  providers: [listOrderService],
  bootstrap: [listOrderComponent],
  exports: [listOrderComponent]
})

export class ListOrderModule {}
