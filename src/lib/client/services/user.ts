import type User from '$lib/types/user';
import Service from '.';
import type { GenericResponseType } from './types';

export type Message = {
  id: number;
  type: string;
  elemId: number;
  counter: number;
  destUserId: any;
  destRolesId: any;
  args: string;
  severity: string;
  createdAt: number;
  updatedAt: number;
  read: boolean;
  text: string;
};

export type MessageResponse = {
  totalRegistres: number;
  messages: Message[];
};

export default class UserService extends Service {
  async getUnread() {
    const url = '/api/v2/message/unread';
    const response = await this.client.get<{ read: number; unread: number }>(url);
    return response.data;
  }

  async renewPassword(password1: string, password2: string, token: string) {
    const url = '/api/v2/user/renew_password';
    const params = {
      password1,
      password2,
      token
    };
    await this.client.post(url, params);
  }
  async getMessages(page: number, pageSize: number) {
    const url = '/api/v2/message';
    const params = {
      page,
      maxRows: pageSize
    };
    const response = await this.client.get<MessageResponse>(url, { params });
    return response.data;
  }

  async markMessageAsRead(messageId: number) {
    const url = `/api/v2/message/${messageId}`;
    const data = { read: false };
    await this.client.put(url, data);
  }

  async deleteMessage(messageId: number) {
    const url = `/api/v2/message/${messageId}`;
    await this.client.delete(url);
  }

  getReleaseNotes() {
    const url = '/api/v2/user/release_notes';
    return this.client.get(url, {
      responseType: 'blob',
      headers: {
        'content-type': 'application/pdf'
      }
    });
  }

  hideReleaseNotesNextTime() {
    const url = '/api/v2/user/release_notes/false';
    return this.client.post(url);
  }

  acceptTerms(value: boolean) {
    const url = `api/v2/user/acceptLicense/${value}`;
    const body = {};
    return this.client.post(url, body);
  }

  shouldEnable2FA() {
    const url = `api/v2/user/forced_mfa`;
    return this.client.get(url);
  }

  getSecondFactorQR() {
    return this.client.get(`api/v2/user/enable2FA`);
  }

  disable2FA() {
    return this.client.put('/api/v2/user/disable2FA');
  }

  editUser(userId: number, user: User) {
    const url = `/api/v2/user/${userId}`;
    return this.client.put(url, user);
  }

  changePassword(currentPassword: string, newPassword: string) {
    const data = {
      currentPassword,
      newPassword
    };
    return this.client.put<GenericResponseType>('/api/v2/user/changepwd', data);
  }
  changeExpiredPassword(userName: string, currentPassword: string, newPassword: string) {
    const data = {
      userName,
      currentPassword,
      newPassword
    };
    return this.client.put<GenericResponseType>('/api/v2/user/change_expired_password', data);
  }

  setMessaging(value: boolean) {
    const data = {
      event_messages: value
    };
    return this.client.put('/api/v2/user/event_messages', data);
  }

  async getTimezones() {
    const response = await this.client.get<string[]>('/api/v2/user/timezone');
    return response.data;
  }

  setTimeOut(value: number) {
    const data = {
      timeout: value
    };
    return this.client.put('/api/v2/user/timeout', data);
  }

  setTimeZones(value: string) {
    const data = {
      timezone: value
    };
    return this.client.put('/api/v2/user/timezone', data);
  }

  setLandingPage(landing: string) {
    const data = {
      landing
    };
    return this.client.put('/api/v2/user/landing', data);
  }

  metricsDownloadReport(reportKey: string) {
    const url = `/api/v2/report_mtrcs/threat_landscape/${reportKey}/download`;
    return this.client.put(url);
  }

  metricsViewReport(reportKey: string) {
    const url = `/api/v2/report_mtrcs/threat_landscape/${reportKey}/view`;
    return this.client.put(url);
  }
}
