import {Component} from '@angular/core';
import {GenericParameterComponent} from "../generic-parameter/generic-parameter.component";
import {GenericParameter} from "../generic-parameter/generic-parameter";
import {HacktivismRss} from "./hacktivism-rss";
import {Grants} from "../../../../../../../services/grants/grants";

@Component({
  selector: 'app-hacktivism-rss',
  templateUrl: '../generic-parameter/generic-parameter.component.html',
  styleUrls: ['../generic-parameter/generic-parameter.component.scss'],
  providers: [{provide: GenericParameter, useClass: HacktivismRss}]
})
export class HacktivismRssComponent extends GenericParameterComponent {
  constructor(public parameterObject: GenericParameter, public grants: Grants) {
    super(parameterObject, grants);
  }

  public renderValue(item) {
    return item && item.title ? item.title : '-';
  }
}
