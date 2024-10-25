import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleSettingsModule } from 'app/dashboard/module-sections/modulesettings/module-settings.module';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule, NgbTooltipModule, ModuleSettingsModule],
  declarations: []
})
export class ExplorerModule {}
