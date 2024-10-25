import {
  Component,
  Input
} from '@angular/core';

@Component({
  selector: 'app-severity',
  templateUrl: './severity.component.html',
  styleUrls: ['./severity.component.scss']
})
export class SeverityComponent {

  @Input() severity: number = 0;

  constructor() { }

}
