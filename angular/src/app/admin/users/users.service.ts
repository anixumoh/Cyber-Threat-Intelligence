import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';
import { Gateway } from 'app/core/models/gateway';

@Injectable()
export class UsersService {
  constructor(private http: HttpUtilsService, private gateway: Gateway) {}

  getUsers(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/user`, requestOptions);
  }

  getUserById(userId, queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/user/${userId}`, requestOptions);
  }

  getGroupDetail(groupId): Observable<any> {
    return this.http.get(`${path}/user/groups/${groupId}`);
  }

  getGroups(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/user/groups`, requestOptions);
  }

  getGrants(id): Observable<any> {
    return this.http.get(`${path}/user/${id}/grant`);
  }

  putGrant(id, grant): Observable<any> {
    delete grant.userId;
    delete grant.username;
    return this.http.put(`${path}/user/${id}/grant`, grant);
  }

  create(data): Observable<any> {
    return this.http.post(`${path}/user`, data);
  }

  edit(data, id): Observable<any> {
    return this.http.put(`${path}/user/${id}`, data);
  }

  createGroup(data): Observable<any> {
    return this.http.post(`${path}/user/groups`, data);
  }

  editUserGroup(data): Observable<any> {
    return this.http.put(`${path}/user/groups/${data.id}`, data);
  }

  deleteUserGroup(data): Observable<any> {
    return this.http.delete(`${path}/user/groups/${data.id}`, data);
  }

  delete(data): Observable<any> {
    return this.http.delete(`${path}/user/${data.id}`);
  }

  newStatusUser(user): Observable<any> {
    return this.http.put(`${path}/user/${user.id}/enable/${user.isEnabled}`, {});
  }

  changePass(userId, newPass): Observable<any> {
    const url: any = `${path}/user/${userId}/changepwd`;
    return this.http.put(url, { newPassword: newPass });
  }

  getCompany(company, items) {
    const url = `/api/customers/search?page=1&size=${items}`;
    const apiId = 'CUSTOMER';
    const data = {
      name: company,
    };
    return this.gateway.post({ url, apiId, data });
  }

  getCompanyName(companyId) {
    const url = `/api/customers/${companyId}`;
    const apiId = 'CUSTOMER';
    return this.gateway.get({ url, apiId });
  }
}
