import { Injectable } from '@angular/core';
import { HttpUtilsService } from '../../services/http-utils.service';
import { Gateway } from 'app/core/models/gateway';

const urlBands = `/api/bands/`;
const apiId = 'CUSTOMER';

@Injectable()
export class CustomerService {
  constructor(private http: HttpUtilsService, private gateway: Gateway) {}

  getAllCustomers(params: any, query?: string) {
    let url = '/api/customers/search';

    if (params) {
      let queryParams = '?';
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) && typeof params[key] !== 'undefined') {
          queryParams += key === Object.keys(params)[0] ? `${key}=${params[key]}` : `&${key}=${params[key]}`;
        }
      }
      url += `${queryParams}`;
    }

    const data: any = {
      customerId: null,
      ...(query ? { name: query } : {}),
    };
    return this.gateway.post({ url, apiId, data });
  }

  createCustomer(data) {
    const url = `/api/customers`;
    return this.gateway.post({ url, apiId, data });
  }

  editCustomer(data, id) {
    const url = `/api/customers/${id}`;
    return this.gateway.put({ url, apiId, data });
  }

  deleteCustomer(id) {
    const url = `/api/customers/${id}`;
    return this.gateway.delete({ url, apiId, data: {} });
  }

  editCustomerContract(data, id) {
    const url = `/api/customers/${id}/contract`;
    return this.gateway.put({ url, apiId, data });
  }

  createCustomerContract(data, id) {
    const url = `/api/customers/${id}/contract`;
    return this.gateway.post({ url, apiId, data });
  }

  getCustomerDetails(id) {
    const url = `/api/customers/${id}`;
    return this.gateway.get({ url, apiId });
  }

  getContractDetails(id) {
    const url = `/api/customer/${id}/contract/modules`;
    return this.gateway.get({ url, apiId });
  }

  getCustomerTypes() {
    const url = `/api/customers/type`;
    return this.gateway.get({ url, apiId });
  }

  assignContract(data, id) {
    const url = `/api/customers/${id}/contract`;
    return this.gateway.put({ url, apiId, data });
  }

  getContract(id) {
    const url = `/api/customers/${id}/contract`;
    return this.gateway.get({ url, apiId });
  }

  getBands() {
    return this.gateway.get({ url: urlBands, apiId });
  }

  getBandDetails(id) {
    const url = `${urlBands}${id}`;
    return this.gateway.get({ url, apiId });
  }

  createBand(data) {
    return this.gateway.post({ url: urlBands, apiId, data });
  }

  editBand(data, id) {
    const url = `${urlBands}${id}`;
    return this.gateway.put({ url, apiId, data });
  }

  deleteBand(id) {
    const url = `${urlBands}${id}`;
    return this.gateway.delete({ url, apiId, data: {} });
  }

  setAllowedModules(id, data) {
    const url = `/api/customer/${id}/contract/modules`;
    return this.gateway.post({ url, apiId, data });
  }

  updateModule(customerId, moduleId, data) {
    const url = `/api/customer/${customerId}/modules/${moduleId}`;
    return this.gateway.post({ url, apiId, data });
  }

  editInvoicing(customerId, moduleId, data) {
    const url = `/api/customer/${customerId}/modules/${moduleId}/invoicing`;
    return this.gateway.patch({ url, apiId, data });
  }
}
