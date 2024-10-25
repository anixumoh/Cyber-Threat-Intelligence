import {Component, Input} from '@angular/core';

export interface ILabelComponent {
  backgroundColor: string;
  color: string;
  name: string
}

@Component({
  selector: 'app-labels',
  template: `
    <span class="list">
      <span class="badge" *ngFor="let item of items" [style.backgroundColor]="item.backgroundColor" [style.color]="item.color">{{item.name}}</span>  
    </span>
  `,
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent {
  @Input() items: ILabelComponent[];
}
