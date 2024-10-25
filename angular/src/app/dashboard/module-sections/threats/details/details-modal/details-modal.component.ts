import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { resourceTypes } from '../../../../../shared/enums/resource-types';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss']
})
export class DetailsModalComponent implements OnInit {
  _item;
  mapData: any[] = [];
  chart: any;
  loading = true;
  resourceTypes = resourceTypes;

  @Input() resourceType;

  private _citySVG =
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

  @Input()
  set item(it) {
    this._item = it;
  }

  get item() {
    return this._item;
  }

  @Output() modalClosed = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.markForCheck();
    }
  }

  ngOnInit() {
    this.proccessItem();
  }

  private proccessItem() {
    const { stolenData } = this.item;
    if (stolenData) {
      this.mapData = [];
      for (const item of stolenData) {
        this.mapData.push({
          latitude: item.botLatitude,
          longitude: item.botLongitude,
          svgPath: this._citySVG,
          title: `${item.botCity ? `${item.botCity}, ` : ''} ${item.botCountryName || ''} `,
          color: '#CC0000'
        });
      }
    }
  }

  closeModal() {
    this.modalClosed.emit();
  }
}
