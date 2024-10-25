import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { CommentComponent } from './comment.component';
import { CommentService } from './comment.service';

@NgModule({
  imports: [FormsModule, NgbModule,CommonModule],
  declarations: [CommentComponent],
  providers: [CommentService],
  bootstrap: [CommentComponent],
  exports: [CommentComponent]
})

export class CommentsModule {}
