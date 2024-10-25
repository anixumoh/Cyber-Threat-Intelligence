import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';

const { clone } = _;

@Component({
  selector: 'app-uploader-settings',
  templateUrl: './uploader-settings.component.html',
  styleUrls: ['./uploader-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploaderSettingsComponent {
  _status = [];
  @Input()
  set status(its) {
    this._status = its;
  }
  get status() {
    return this._status;
  }
  @Input() isDisable = false;
  @Input() isModule = true;
  @Input() isDelete = false;
  @Input() allowedUrl = true;
  @Input() uploaderInfo = true;
  @Input() multipleSelect = false;

  @Output() uploadFile = new EventEmitter();
  @Output() uploadUrl = new EventEmitter();
  @Output() onClose = new EventEmitter();
  @Output() removeFile = new EventEmitter();
  @Output() reUploadFile = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() deleteFile = new EventEmitter();

  url: string;
  isMinified = true;

  toogleMinified() {
    this.isMinified = !this.isMinified;
  }

  shortenFilename(filename) {
    let out = filename;
    if (filename.length > 50) out = filename.substr(0, 40) + '...' + filename.substr(-8, 8);
    return out;
  }

  isUploading(status) {
    return status.some((s) => s.status === 'uploading');
  }

  getNumUploaded(status) {
    return status.filter((s) => s.status === 'complete').length;
  }

  getNumUploading(status) {
    return status.filter((s) => s.status === 'uploading').length;
  }

  getNumError(status) {
    return status.filter((s) => s.status === 'error').length;
  }

  estimatedTime(status) {
    return Math.round(Math.floor(status.map((x) => x.estimatedTime || 0).reduce((a, b) => (a > b ? a : b), 0)));
  }
}
