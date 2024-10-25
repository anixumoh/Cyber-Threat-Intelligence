import { SEARCH_KEY, SORT_KEY } from './constants';

export function getSearchUrl(searchWord: string, sort: 'desc' | 'asc', orgId: number, moduleId: number) {
  const params = new URLSearchParams({
    [SEARCH_KEY]: searchWord,
    [SORT_KEY]: sort
  });
  return `/dashboard/organizations/${orgId}/modules/${moduleId}/search?${params}`;
}

export function validateSortKey(sort: string): 'desc' | 'asc' {
  if (sort === 'asc' || sort === 'desc') return sort;
  return 'desc';
}

export function diffString(o: string, n: string) {
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  const out = diff(o == '' ? [] : o.split(/\s+/), n == '' ? [] : n.split(/\s+/));
  let str = '';

  let oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ['\n'];
  } else {
    oSpace.push('\n');
  }
  let nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ['\n'];
  } else {
    nSpace.push('\n');
  }

  if (out.n.length == 0) {
    for (let i = 0; i < out.o.length; i++) {
      str += "<span style='background:#ffe49c;text-decoration:line-through'>" + out.o[i] + oSpace[i] + '</span>';
    }
  } else {
    if (out.n[0].text == null) {
      for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
        str += "<span style='background:#ffe49c;text-decoration:line-through'>" + out.o[n] + oSpace[n] + '</span>';
      }
    }

    for (let i = 0; i < out.n.length; i++) {
      if (out.n[i].text == null) {
        str += "<span style='background:#bbddff !important;'>" + out.n[i] + nSpace[i] + '</span>';
      } else {
        let pre = '';

        for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
          pre += "<span style='background:#ffe49c;text-decoration:line-through'>" + out.o[n] + oSpace[n] + '</span>';
        }
        str += ' ' + out.n[i].text + nSpace[i] + pre;
      }
    }
  }

  return str;
}

export function diff(o: any, n: any) {
  const ns = new Object();
  const os = new Object();

  for (let i = 0; i < n.length; i++) {
    if (ns[n[i]] == null) ns[n[i]] = { rows: [], o: null };
    ns[n[i]].rows.push(i);
  }

  for (let i = 0; i < o.length; i++) {
    if (os[o[i]] == null) os[o[i]] = { rows: [], n: null };
    os[o[i]].rows.push(i);
  }

  for (const i in ns) {
    if (ns[i].rows.length == 1 && typeof os[i] != 'undefined' && os[i].rows.length == 1) {
      n[ns[i].rows[0]] = { text: n[ns[i].rows[0]], row: os[i].rows[0] };
      o[os[i].rows[0]] = { text: o[os[i].rows[0]], row: ns[i].rows[0] };
    }
  }

  for (let i = 0; i < n.length - 1; i++) {
    if (
      n[i].text != null &&
      n[i + 1].text == null &&
      n[i].row + 1 < o.length &&
      o[n[i].row + 1].text == null &&
      n[i + 1] == o[n[i].row + 1]
    ) {
      n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
      o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
    }
  }

  for (let i = n.length - 1; i > 0; i--) {
    if (
      n[i].text != null &&
      n[i - 1].text == null &&
      n[i].row > 0 &&
      o[n[i].row - 1].text == null &&
      n[i - 1] == o[n[i].row - 1]
    ) {
      n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
      o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
    }
  }

  return { o, n };
}
