import { Injectable } from '@angular/core';

import { path, HttpUtilsService } from './http-utils.service';

@Injectable()
export class FilesService {
  constructor(private httpUtilsService: HttpUtilsService) { }

  uploadMalwareFile(organizationId, moduleId, moduleName, file, isUrl: boolean = false, url = '') {
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/upload`;

    let formData = new FormData();
    if (isUrl) {
      formData.append('url', url);
    } else {
      formData.append('fileInput', file);
      formData.append('filename', file.name);
    }

    formData.append('type', isUrl ? 'url' : 'file');
    return this.httpUtilsService.multipartFormPost(allPath, formData);
  }

  uploadMalwareUrl(organizationId, moduleId, moduleName, url) {
    return this.uploadMalwareFile.call(this, organizationId, moduleId, moduleName, null, true, url);
  }
}
