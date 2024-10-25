import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class MessagesService {
  constructor(private http: HttpUtilsService) {}

  list(params) {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: params });
    return this.http.get(`${path}/message`, requestOptions);
  }

  count() {
    return this.http.get(`${path}/message/unread`);
  }

  update(id, body) {
    return this.http.put(`${path}/message/${id}`, body);
  }

  destroy(id) {
    return this.http.delete(`${path}/message/${id}`);
  }

  destroyMany(ids) {
    return this.http.put(`${path}/message/deleteMultiple`, ids);
  }
}
