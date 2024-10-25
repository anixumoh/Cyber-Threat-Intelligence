import {Injectable} from '@angular/core';
import {IQuerystringsParams, ThiappGateway} from "./thiapp.gateway";

@Injectable()
export class TargetsService {
  constructor(private thiappGateway: ThiappGateway) {
  }

  list({limit, page, searchField, searchValue}: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring({limit, page, searchField, searchValue});
    const url = `/target/?${queryString}`;
    return this.thiappGateway.get({url});
  }

  actorsList({limit, page, searchValue, searchField, targetId}: IQuerystringsParams & {targetId: number}) {
    const queryString = this.thiappGateway.getQuerystring({limit, page, searchValue, searchField});
    const url = `/target/${targetId}/threat-actor/?${queryString}`;
    return this.thiappGateway.get({url});
  }

  addActor({id, data}) {
    const url = `/target/${id}/relationships/threat-actor/`;
    return this.thiappGateway.post({url, data});
  }

  removeActor({id, data}) {
    const url = `/target/${id}/relationships/threat-actor/`;
    return this.thiappGateway.delete({url, data});
  }

  getActors(id) {
    const url = `/target/${id}/relationships/threat-actor/`;
    return this.thiappGateway.get({url});
  }

  details(id) {
    return this.thiappGateway.get({url: `/target/${id}/`})
  }

}
