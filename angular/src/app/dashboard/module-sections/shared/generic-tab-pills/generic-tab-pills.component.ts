import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-generic-tab-pills',
  templateUrl: './generic-tab-pills.component.html',
  styleUrls: ['./generic-tab-pills.component.scss']
})
export class GenericTabPillsComponent {


  currentTab: string;
  isPressed:boolean=true;
  contentQuantity=[];
  _content: Array<any> = new Array();

  @Input()tabsTitle : string;
  @Input()contentTitle : string;
  @Input()
  get content() {
      return this._content;
  }

  set content(v) {
    this._content = Object.keys(v);
    this.contentQuantity=[]
    for (var p in v) {
      this.contentQuantity.push({isLoading: v[p].isLoading, length: v[p].length})
    }
  }

  @Output() onSelectEmitter = new EventEmitter<string>()

  constructor() {}

  onSelect(key) {
      this.onSelectEmitter.emit(key);
      this.currentTab = key;
      if(this.content.indexOf(key)!==0 && this.isPressed){
        this.isPressed=false;
      }
  }
}

