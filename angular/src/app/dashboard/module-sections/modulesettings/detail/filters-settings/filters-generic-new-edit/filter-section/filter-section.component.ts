import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent {
  @Input() title = '';
  @Input() addConditionClass = false;
  constructor() {}
}
