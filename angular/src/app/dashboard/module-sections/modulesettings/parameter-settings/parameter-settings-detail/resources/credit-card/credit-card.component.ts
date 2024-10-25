import {Component} from '@angular/core';
import {GenericParameterComponent} from "../generic-parameter/generic-parameter.component";
import {CreditCart} from "./credit-cart";
import {GenericParameter} from "../generic-parameter/generic-parameter";
import {Grants} from "../../../../../../../services/grants/grants";

@Component({
  selector: 'app-credit-card',
  templateUrl: '../generic-parameter/generic-parameter.component.html',
  styleUrls: ['../generic-parameter/generic-parameter.component.scss'],
  providers: [{provide: GenericParameter, useClass: CreditCart}]
})
export class CreditCardComponent extends GenericParameterComponent {
  constructor(public parameterObject: GenericParameter, public grants: Grants) {
    super(parameterObject, grants);
  }
}
