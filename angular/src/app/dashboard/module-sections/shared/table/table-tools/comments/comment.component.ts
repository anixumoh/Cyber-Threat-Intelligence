import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CommentService } from './comment.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'resource-comments',
  templateUrl: './comment.component.html',
  providers: [CommentService],
  styleUrls: ['./comment.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class CommentComponent implements OnInit, OnDestroy {
  @ViewChild('modalCard') modalCard: ElementRef;
  @Input()
  set resourceId(res) {
    if (res !== this._resourceId) {
      this._resourceId = res;
      if (this.moduleName) {
        this.getComments();
      }
    }
  }
  @Input() moduleName;
  @Input()
  set eraseComments(bool) {
    if (bool === true) {
      this.eraseCom = true;
      this.comments = [];
    }
  }
  @Input()
  set getCom(bool) {
    if (bool) {
      this.eraseCom = false;
      this.getComments();
    }
  }
  @Input() openModal = false;
  @Input() commentModalButtons: HTMLElement[] = [];
  @Output() commentsNumber = new EventEmitter();
  @Output() close = new EventEmitter();

  get resourceId() {
    return this._resourceId;
  }

  comments = [];
  comment: string;
  eraseCom = false;
  _resourceId: any;
  private readonly destroy$ = new Subject<void>();

  constructor(private router: Router, private commentService: CommentService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.getComments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClickOutside(event) {
    if (this.checkModalCard(event.target) && !this.checkCommentsModalButtonsAndTargetElement(event.target)) {
      this.openModal = false;
    }
  }

  toggleMenu() {
    this.openModal = !this.openModal;
  }

  checkModalCard(target) {
    return this.modalCard && this.modalCard.nativeElement && !this.modalCard.nativeElement.contains(target);
  }

  checkCommentsModalButtonsAndTargetElement(target) {
    return (
      this.commentModalButtons &&
      this.commentModalButtons.length &&
      this.commentModalButtons.findIndex((el: HTMLElement) => {
        return el.contains(target);
      }) !== -1
    );
  }

  getComments() {
    if (!this.eraseCom) {
      this.commentService
        .getComments(this.router.url, this._resourceId, this.moduleName)
        .pipe(takeUntil(this.destroy$))
        .subscribe((comments) => {
          this.comments = comments;
          this.commentsNumber.emit(this.comments.length);
          this.cd.markForCheck();
        });
    }
  }

  getAvatar(item: string) {
    if (item) {
      return item[0].toUpperCase();
    }
  }

  setNewComment() {
    this.comment = this.comment.trim();
  }

  saveComment() {
    console.log(this.comment);
    if (this.comment) {
      this.comments.push({ content: this.comment, creationDate: new Date().getTime(), creationUsername: '' });

      this.commentService
        .saveComment(this.router.url, this._resourceId, this.moduleName, this.comment)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.comment = '';
          this.getComments();
        });
    }
  }

  deleteComment(comment) {
    this.commentService
      .deleteComment(this._resourceId, comment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.comments.forEach((c, index) => {
          if (c.id === comment.id) {
            this.comments.splice(index, 1);
          }
        });
        this.commentsNumber.emit(this.comments.length);
      });
  }
}
