import axios from 'axios';
import Service from '.';

export default class FilesService extends Service {
  abort() {}

  async uploadMalwareFile(orgId: number, moduleId: number, moduleName: string, file: File, isUrl = false, url = '') {
    const endPoint = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/upload`;

    const formData = new FormData();
    if (isUrl) {
      formData.append('url', url);
    } else {
      formData.append('fileInput', file);
      formData.append('filename', file.name);
    }

    formData.append('type', isUrl ? 'url' : 'file');
    return await axios.postForm(endPoint, formData);
  }
}
