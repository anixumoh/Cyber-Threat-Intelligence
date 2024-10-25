import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-signature-description',
  templateUrl: './signatures-description.component.html',
  styleUrls: ['./signatures-description.component.scss'],
})
export class SignaturesDescriptionComponent {
  @Input() model: { signature: string; references: string[] };
}
