import { Injectable } from '@angular/core';
import { HttpUtilsService, path } from '../../services/http-utils.service';

@Injectable()
export class ResourcesService {
  constructor(private http: HttpUtilsService) {}

  addManually({ organizationId, moduleId, item }) {
    return this.http.post(`${path}/organization/${organizationId}/module/${moduleId}/resource/add`, item);
  }
}
