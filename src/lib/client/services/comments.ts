import type { CommentType } from '$lib/types/comments';
import type { CancelTokenSource } from 'axios';
import Service from '.';

export default class CommentsService extends Service {
  cancelTokenGetComments: CancelTokenSource;
  abort() {
    this.cancelTokenGetComments?.cancel();
  }

  async getComments(orgId: number, moduleId: number, moduleName: string, resourceId: number, url: string) {
    let targetUrl = '';
    const splitted = url.split('/');
    if (splitted.includes('incidents')) {
      targetUrl = `api/v2/organization/${orgId}/module/${moduleId}/issue/${resourceId}/comment`;
    } else {
      targetUrl = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment`;
    }
    return await this.client.get<CommentType[]>(targetUrl);
  }

  async saveComment(
    orgId: number,
    moduleId: number,
    moduleName: string,
    resourceId: number,
    url: string,
    comment: string
  ) {
    let targetUrl = '';
    const splitted = url.split('/');
    if (splitted.includes('incidents')) {
      targetUrl = `api/v2/organization/${orgId}/module/${moduleId}/issue/${resourceId}/comment`;
      return await this.client.post(targetUrl, { comment });
    } else {
      targetUrl = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment`;
      return await this.client.put(targetUrl, { comment });
    }
  }

  async deleteComment(orgId: number, moduleId: number, moduleName: string, resourceId: number, commentId: number) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment/${commentId}`;
    return await this.client.delete(url);
  }
}
