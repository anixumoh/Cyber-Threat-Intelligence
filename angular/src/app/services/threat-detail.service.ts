import { Injectable } from '@angular/core';

export type Details = {
  resourceId: number;
  q: string;
  resources: number[];
  page: number;
  lastPage: number;
  maxRows: number;
  moduleId: number;
  moduleName: string;
  filters: any;
};

@Injectable()
export class ThreatDetailService {
  details: Details;

  setThreatDetails(details: Details) {
    this.details = details;
  }
}
