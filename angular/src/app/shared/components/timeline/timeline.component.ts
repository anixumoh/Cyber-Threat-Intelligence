import { Component, Input } from '@angular/core';
import { Timeline } from './timeline.cs';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  @Input() moduleId;
  @Input() orgId;
  @Input() timelineData: Timeline[];
  showDescription = location.hostname === 'tcctiplabs.blueliv.com' || location.hostname === 'tipfe.blueliv.com';

  isMalware(item) {
    return item.title.toLowerCase() === 'malware';
  }

  buildIndicatorLink(id) {
    if (id) {
      return `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/indicators/malware/resource/${id}`;
    }
    return null;
  }

  buildReportLink(id) {
    if (id) {
      return `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/malwares/${id}/summary`;
    }
    return null;
  }
}
