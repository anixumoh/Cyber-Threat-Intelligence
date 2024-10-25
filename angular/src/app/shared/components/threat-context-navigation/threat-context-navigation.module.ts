import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThreatContextNavigationComponent } from './threat-context-navigation.component';
import { ThreatContextNavigationService } from './threat-context-navigation.service';

@NgModule({
  imports: [CommonModule],
  declarations: [ThreatContextNavigationComponent],
  providers: [ThreatContextNavigationService],
  exports: [ThreatContextNavigationComponent]
})
export class ThreatContextNavigationModule {}
