import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingBluelivComponent } from 'app/dashboard/module-sections/shared/table/table-tools/star-rating-blueliv/star-rating-blueliv.component';
import { StarRatingBluelivService } from 'app/dashboard/module-sections/shared/table/table-tools/star-rating-blueliv/star-rating-blueliv.service';

@NgModule({
  imports: [CommonModule],
  declarations: [StarRatingBluelivComponent],
  bootstrap: [StarRatingBluelivComponent],
  exports: [StarRatingBluelivComponent],
  providers: [StarRatingBluelivService],
})
export class StarRatingBluelivModule {}
