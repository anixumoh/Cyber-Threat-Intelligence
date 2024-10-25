import { of as observableOf, Subscription, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Component, Input, OnDestroy, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';

import * as FileSaver from 'file-saver';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { DetailExtraInfoService } from '../details-extra-info.service';

declare var require: any;
const Mark = require('mark.js');

const MODULE_NAME = {
  MEDIA_TRACKER: 'media_tracker',
  CREDENTIALS: 'credentials'
};

@Component({
  selector: 'moreInfoDetail',
  templateUrl: './more-info-detail.component.html',
  styleUrls: ['./more-info-detail.component.scss']
})
export class MoreInfoDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  s;
  @ViewChildren('expandedContentElement')
  expandedContentBox: QueryList<any>;
  @ViewChildren('contentElement')
  contentBox: QueryList<any>;
  @Input() resource;
  @Input() searchWords;
  @Input()
  set isMenuViewMoreOpened(its) {
    this._isMenuViewMoreOpened = its;
  }
  @Input()
  set moreInfoData(d) {
    this._moreInfoData = d;
    if (this._moreInfoData) {
      this.setNewMoreInfo();
    } else {
      this.dataToPrint = [];
    }
  }

  expandedView = false;
  expandedContent;
  conversation: any;
  contentFromDarkWeb: string;
  domain: any;
  distance: any;
  detectedDate: any;
  category: any;
  createdAt: any;
  documentUrl: any;
  activeModuleName: any;
  currentSubscription: Subscription;
  currentSubscription2: Subscription;
  markDown: any;
  screenshot: any;
  highlights: any;
  lastSeenUp: any;
  firstSeen: any;
  keys;
  twitter;
  image;
  date;
  excerpt;
  description;
  htmlContent;
  target;
  userName;
  ownerName;
  urls;
  snippet;
  content;
  created;
  title;
  market: any;
  platform: any;
  articleContent;
  modalExpandImage = false;
  jsonContent;
  focused = 0;
  totalMatches;
  contentStopper = false;
  dataToPrint: any[];
  _isMenuViewMoreOpened;
  _moreInfoData;
  expandFocused = 0;
  expandStopper = false;
  moduleDictionary = MODULE_NAME;
  isPhp = false;
  safeImageContent;
  isLoadingImage = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private detailExtraInfoService: DetailExtraInfoService
  ) {}

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((context) => {
          if (context.currentModule.id) {
            this.activeModuleName = context.currentModule.moduleName;
          }
          return observableOf(null);
        }),
        switchMap((res) => {
          this.markDown = res;
          return observableOf(null);
        })
      )
      .subscribe((res) => {
        this.contentFromDarkWeb = res;
      });
  }

  ngAfterViewInit() {
    const options = {};
    this.contentBox.changes.subscribe((res) => {
      if (!this.contentStopper) {
        const content = document.querySelector('.content');
        if (content) {
          const instance = new Mark(content);
          instance.mark(this.searchWords, { separateWordSearch: false });
          const matches = content.getElementsByTagName('mark');
          this.totalMatches = matches.length;
          this.contentStopper = true;
        }
      }

      if (!this.expandStopper) {
        const expandedContent = document.querySelector('.expanded-content');

        if (expandedContent) {
          const instance = new Mark(expandedContent);
          instance.mark(this.searchWords, { separateWordSearch: false });
          this.expandStopper = true;
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  focus(type) {
    const content = document.querySelector('.content');
    const matches = content.getElementsByTagName('mark');
    let index = this.focused > 0 ? this.focused - 1 : 0;
    matches[index].classList.remove('selected');

    switch (type) {
      case 'next':
        this.focused++;

        if (this.focused > this.totalMatches) {
          this.focused = 1;
        }

        index = this.focused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        break;

      case 'previous':
        this.focused = this.focused > 0 ? this.focused - 1 : 0;
        if (this.focused === 0) {
          this.focused = this.totalMatches;
        }

        index = this.focused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        break;
    }
  }

  expandFocus(type) {
    const content = document.querySelector('.expanded-content');
    const matches = content.getElementsByTagName('mark');
    let index = this.expandFocused > 0 ? this.expandFocused - 1 : 0;
    matches[index].classList.remove('selected');

    switch (type) {
      case 'next':
        this.expandFocused++;

        if (this.expandFocused > this.totalMatches) {
          this.expandFocused = 1;
        }

        index = this.expandFocused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        break;

      case 'previous':
        this.expandFocused = this.expandFocused > 0 ? this.expandFocused - 1 : 0;
        if (this.expandFocused === 0) {
          this.expandFocused = this.totalMatches;
        }

        index = this.expandFocused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        break;
    }
  }

  get isMenuViewMoreOpened() {
    return this._isMenuViewMoreOpened;
  }

  setNewMoreInfo() {
    const temp = JSON.parse(JSON.stringify(this._moreInfoData));

    if (temp['Contains Secrets']) {
      delete temp['Contains Secrets'];
    }

    this.dataToPrint = Object.keys(temp).map((key) => {
      if (temp && temp[key] && temp[key][0] && temp[key][0].type === 'IMAGE') {
        const isBase64 = temp[key][0].value.startsWith('data:image');
        if (isBase64) {
          this.safeImageContent = temp[key][0].value;
        } else if (!this.safeImageContent && !this.isLoadingImage) {
          this.isLoadingImage = true;
          this.getSafeImage(temp[key][0].value);
        }
      }
      return {
        type: key,
        value: temp[key]
      };
    });
    this.dataToPrint.forEach((data) => {
      if (data.value.length > 0 && data.value[0].value) {
        data.value.map((subData) => {
          if (subData.type === 'JSON' && this.activeModuleName === this.moduleDictionary.CREDENTIALS) {
            const json = JSON.parse(subData.value);
            this.jsonContent = json[0];
          }
        });
      }
    });

    let htmlIndex: number;
    this.dataToPrint.forEach((data, index) => {
      if (data.type === 'Content') {
        htmlIndex = index;
        this.isPhp = this.dataToPrint[index].value[0].value.startsWith('<?');
        if (this.isPhp) {
          this.dataToPrint[index]['isPhp'] = true;
        }

        this.dataToPrint[index].value[0].type = 'RAW';
        this.expandedContent = typeof htmlIndex !== 'undefined' ? this.dataToPrint[index].value[0].value : '';
        return htmlIndex;
      }

      if (data.type === 'Secrets') {
        const json = this.dataToPrint[index].value[0].value;
        if (this.isJsonString(json)) {
          this.dataToPrint[index].value[0].value = JSON.stringify(
            JSON.parse(this.dataToPrint[index].value[0].value),
            null,
            2
          );
        }
      }
    });
  }

  getSafeImage(url) {
    this.detailExtraInfoService
      .getSafeImage(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (image) => {
          this.safeImageContent = `data:image/png;base64,${image}`;
          this.isLoadingImage = false;
        },
        (e) => {
          this.safeImageContent = 'assets/default_images/No_image.jpg';
          this.isLoadingImage = false;
        }
      );
  }

  createImage(image) {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.safeImageContent = reader.result;
        this.isLoadingImage = false;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  // Creates a new array of search ips with all the matching possibilities
  highlightIp(uniqueWords) {
    let ips = uniqueWords;

    uniqueWords.map((word) => {
      if (word.match(/\.[0-9]+\/*[0-9]*$/)) {
        let ip1 = word.replace(/\/[0-9]*/, '');
        ips.push(ip1);

        let ip2 = word.replace(/\.[0-9]+\/*[0-9]*$/, '');
        ips.push(ip2);
      } else if (word.match(/\/[0-9]*$/)) {
        let ip3 = word.replace(/\/[0-9]*$/, '');
        ips.push(ip3);
      }
    });

    const uniqueIps = [...new Set(ips)];
  }

  openModalExpandImage() {
    this.modalExpandImage = true;
  }

  closeModalExpandImage() {
    this.modalExpandImage = false;
  }

  openExpandContent(content) {
    this.expandedContent = content;
    this.expandedView = true;
  }

  downloadHashFile() {
    if (this._moreInfoData['App Hash'] && this._moreInfoData['App Hash'][0].value) {
      this.detailExtraInfoService
        .downloadShaFile(this.resource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            const blob = new Blob([response], {
              type: 'application/octet-stream'
            });
            FileSaver.saveAs(blob, 'apphash.apk');
          },
          (e) => {
            console.error('error', e);
          }
        );
    }
  }
}
