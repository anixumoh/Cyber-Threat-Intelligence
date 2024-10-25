import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreColorComponent } from 'app/dashboard/intelligence/details-intelligence/share/score-color/score-color.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ ScoreColorComponent ],
  exports: [ ScoreColorComponent ]
})
export class ScoreColorModule { }
