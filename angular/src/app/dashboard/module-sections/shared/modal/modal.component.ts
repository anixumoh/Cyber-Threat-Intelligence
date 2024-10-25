import { Observable } from 'rxjs';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ChangeDetectionStrategy,
  NgZone,
  ViewChild,
  SimpleChanges,
  OnInit,
  HostListener
} from '@angular/core';
import { NgLocalization } from '@angular/common';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'modal-window',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit {
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 27 || event.key === 'Escape') {
      this.abort();
    }
  }

  @ViewChild('modalCard') modalCard: ElementRef;

  @Input() modalTitle;
  @Input() dorks;
  @Input() dorksThreathContext;
  @Input() dorksThreathContextType;
  @Input() dorkFields;
  @Input() modalBody;
  @Input() linkBody;
  @Input() acceptBtn;
  @Input() cancelBtn;
  @Input() closeBtn;
  @Input() zIndex = 900;
  @Input() customClass = '';
  @Input() modalClass = '';
  @Input() headerClass = '';
  @Input() imageBodyIssue;
  @Input() warning;
  @Input() info;
  @Input() hideFooterButtons = false;
  @Input()
  set bodyForPre(body) {
    this._bodyForPre = this.sanitizer.bypassSecurityTrustHtml(body);
  }
  @Input()
  set imageBody(body) {
    this._imageBody = body;
  }
  @Input()
  set disabledAccept(disabled) {
    this._disabledAccept = disabled;
  }
  @Input()
  set loadingAccept(loading) {
    this._loadingAccept = loading;
  }

  @Output() accept = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() changeDork = new EventEmitter();

  private _imageBody: any = null;
  private _bodyForPre: any = null;
  private _loadingAccept = false;
  private _disabledAccept = false;
  private isReadyToClose = false;

  get bodyForPre() {
    return this._bodyForPre;
  }

  get imageBody() {
    return this._imageBody;
  }

  get disabledAccept() {
    return this._disabledAccept;
  }

  get loadingAccept() {
    return this._loadingAccept;
  }

  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    setTimeout(() => {
      this.isReadyToClose = true;
    });
  }

  setDork(dork) {
    this.changeDork.emit(dork);
  }

  checkModalCard(target) {
    return this.modalCard && this.modalCard.nativeElement && !this.modalCard.nativeElement.contains(target);
  }

  abort() {
    this.cancel.emit(true);
  }

  clickOutside($event) {
    const id = $event.srcElement.id;

    if (id === 'modal-container') {
      this.cancel.emit(true);
    }
  }
}
