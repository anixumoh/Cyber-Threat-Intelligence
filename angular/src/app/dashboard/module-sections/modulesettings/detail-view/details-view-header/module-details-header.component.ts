import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-module-details-header',
  templateUrl: './module-details-header.component.html',
  styleUrls: ['./module-details-header.component.scss'],
})
export class ModuleDetailsHeaderComponent {
  _headerData;
  _resource;
  _downloadedImage;
  iconsHeaderData = [
    { name: 'Label', value: 'active', isBoolean: true, icon: 'assets/icons/detail-header/label.svg' },
    { name: 'Internet', value: 'types', icon: 'assets/icons/detail-header/internet.svg' },
    { name: 'Last Seen', value: 'time', isDate: true, icon: 'assets/icons/detail-header/time.svg' },
    { name: 'Country', value: 'country', icon: 'assets/icons/detail-header/country.svg' },
    { name: 'Content Type', value: 'content_type', icon: 'assets/icons/detail-header/content_type.svg' },
    { name: 'Language', value: 'language', icon: 'assets/icons/detail-header/language.svg' },
    { name: 'Search words', value: 'search_words', icon: 'assets/icons/detail-header/search_words.svg' },
    { name: 'Title', value: 'title', icon: 'assets/icons/detail-header/name.svg' },
    { name: 'Url', value: 'url', icon: 'assets/icons/detail-header/url.svg' },
    { name: 'Transform', value: 'transform', icon: 'assets/icons/detail-header/transform.svg' },
  ];

  @Input()
  set downloadedImage(its) {
    this._downloadedImage = its;
  }

  get downloadedImage() {
    return this._downloadedImage;
  }

  @Input()
  set headerData(its) {
    this._headerData = its;
  }

  get headerData() {
    return this._headerData;
  }

  @Input()
  set resource(its) {
    if (its.downloadedImage === '') {
      its.downloadedImage = 'assets/default_images/no_image.svg';
    }
    this._resource = its;
  }

  get resource() {
    return this._resource;
  }

  @Input() withoutAvatar = false;

  constructor() {}
}
