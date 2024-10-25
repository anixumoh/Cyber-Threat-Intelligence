import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AssetsComponent } from 'app/pages/global-settings/assets.component';
import { AssetsService } from './assets.service';
import { ModalModule } from '../../dashboard/module-sections/shared/modal/modal.module';
import { AssetsCardComponent } from './views/generic/assets-card.component';
import { AssetsFiltersComponent } from './views/filters/assets-filters.component';
import { UploaderSettingsModule } from 'app/dashboard/module-sections/shared/uploader-settings/uploader-settings.module';

@NgModule({
  declarations: [AssetsComponent, AssetsCardComponent, AssetsFiltersComponent],
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TypeaheadModule.forRoot(),
    SharedModule,
    ModalModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    UploaderSettingsModule,
    ScrollingModule
  ],
  providers: [AssetsService]
})
export class AssetsModule {}
