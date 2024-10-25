import { Component, Input } from '@angular/core';

@Component({
  selector: 'threat-actors-details-description',
  templateUrl: './threat-actors-details-description.component.html',
  styleUrls: ['./threat-actors-details-description.component.scss']
})
export class ThreatActorsDetailsDescriptionComponent {
  @Input() item;
}
