import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'file-extension',
  templateUrl: './file_extension.component.html',
  styleUrls: ['./file_extension.component.scss'],
})
export class FileExtensionComponent extends SettingDetailAbstract implements OnInit {
  checkboxValues = [
    { name: 'Documents', value: 'doc', selected: false },
    { name: 'Data Files', value: 'data', selected: false },
    { name: 'Audio', value: 'audio', selected: false },
    { name: 'Video', value: 'video', selected: false },
    { name: 'Image', value: 'image', selected: false },
    { name: 'Compressed', value: 'zip', selected: false },
    { name: 'Disk Image', value: 'disk', selected: false },
    { name: 'Other', value: 'other', selected: false },
  ];

  checkboxValuesEntity = {
    doc: 0,
    data: 1,
    audio: 2,
    video: 3,
    image: 4,
    zip: 5,
    disk: 6,
    other: 7,
  };

  initContext() {
    super.initContext();
    this.activateCheckboxes();
  }

  activateCheckboxes() {
    this.values.forEach((element) => {
      this.checkboxValues[this.checkboxValuesEntity[element.value]].selected = true;
    });
  }

  sendStatus(value) {
    if (value.selected) {
      this.data.values_to_add = [{ value: value.value }];
      this.sendData();
    } else {
      this.selectedItems = [{ value: value.value }];
      this.deleteData();
    }
  }
}
