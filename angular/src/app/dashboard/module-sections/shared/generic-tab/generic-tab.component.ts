import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-generic-tab',
  templateUrl: './generic-tab.component.html',
  styleUrls: ['./generic-tab.component.scss']
})
export class GenericTabComponent {


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

  set content(tabs) {
    this._content = Object.keys(tabs);
    this.contentQuantity=[]
    for (let item in tabs) {
      if (item) {
        this.contentQuantity.push({isLoading: tabs[item].isLoading, length: tabs[item].length});
      }
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

