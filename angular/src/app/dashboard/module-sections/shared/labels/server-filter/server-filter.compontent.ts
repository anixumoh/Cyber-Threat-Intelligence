import {
  Component,
} from '@angular/core';
import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';

@Component({
  selector: 'app-server-filter',
  templateUrl: './server-filter.component.html',
  styleUrls: ['./server-filter.component.scss'],
})
export class ServerFilterComponent{
  labelsList: any;

  constructor(
    private labelsService: LabelsService
  ) {}

  onFilterByLabel() {
    this.labelsService.filterByLabel();
  }
}


