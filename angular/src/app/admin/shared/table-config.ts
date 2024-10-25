export class TableConfig {
  pagination = <any>{};
  results = <any>{};
  header = <any>{};
  isLoading = false;
  queryParam = <any>{};

  constructor(pagination = <any>{}, results = <any>{}, header = <any>{}, isLoading = false, queryParam = <any>{}) {
    this.pagination = pagination;
    this.results = results;
    this.header = header;
    this.isLoading = isLoading;
    this.queryParam = queryParam;
  }

  get queryPagination() {
    let retorno = '';
    const arrayQP = [this.pagination, this.queryParam];
    for (const qp of arrayQP) {
      const auxQueryParam = Object.keys(qp) || [];
      if (qp && auxQueryParam.length) {
        const obj = [];
        for (const item of auxQueryParam) {
          if (qp[item] !== null) {
            obj.push(`${item}=${qp[item]}`);
          }
        }
        if (retorno) {
          retorno += '&';
        }
        retorno += obj.join('&');
      }
    }

    return retorno;
  }
}
