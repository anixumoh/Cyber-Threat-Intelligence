import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import * as Papa from 'papaparse';
import * as moment from 'moment-timezone';

const paramTypes = [
  { type: 'java.lang.String', name: 'String' },
  { type: '[Ljava.lang.String;', name: 'String Array' },
  { type: 'java.lang.Integer', name: 'Integer' },
  { type: '[Ljava.lang.Integer;', name: 'Integer Array' },
  { type: 'java.lang.Long', name: 'Long' },
  { type: '[Ljava.lang.Long;', name: 'Long Array' },
  { type: 'java.lang.Boolean', name: 'Boolean' },
  { type: '[Ljava.lang.Boolean;', name: 'Boolean Array' },
  { type: 'java.lang.Object', name: 'Object' },
  { type: '[Ljava.lang.Object;', name: 'Object Array' }
];

const mimeTipes = [
  { type: 'audio/aac', extension: '.aac' },
  { type: 'application/x-abiword', extension: '.abw' },
  { type: 'application/octet-stream', extension: '.pcap' },
  { type: 'video/x-msvideo', extension: 'avi' },
  { type: 'application/vnd.amazon.ebook', extension: '.azw' },
  { type: 'application/x-archive', extension: '.arc' },
  { type: 'application/x-archive', extension: '.deb' },
  { type: 'application/x-bzip2', extension: '.bz2' },
  { type: 'application/x-csh', extension: '.csh' },
  { type: 'text/css', extension: '.css' },
  { type: 'text/csv', extension: '.csv' },
  { type: 'application/msword', extension: '.doc' },
  { type: 'application/epub+zip', extension: '.epub' },
  { type: 'image/gif', extension: '.gif' },
  { type: 'text/html', extension: '.html' },
  { type: 'image/x-icon', extension: '.ico' },
  { type: 'text/calendar', extension: '.ics' },
  { type: 'application/java-archive', extension: '.jar' },
  { type: 'application/x-gzip', extension: '.gz' },
  { type: 'image/jpeg', extension: '.jpg' },
  { type: 'application/javascript', extension: '.js' },
  { type: 'text/plain', extension: '.txt' },
  { type: 'application/json', extension: '.json' },
  { type: 'audio/midi', extension: '.midi' },
  { type: 'video/mpeg', extension: '.mpeg' },
  { type: 'application/vnd.apple.installer+xml', extension: '.mpkg' },
  { type: 'application/vnd.oasis.opendocument.presentation', extension: '.odp' },
  { type: 'application/vnd.oasis.opendocument.spreadsheet', extension: '.ods' },
  { type: 'application/vnd.oasis.opendocument.text', extension: '.odt' },
  { type: 'audio/ogg', extension: '.oga' },
  { type: 'video/ogg', extension: '.ogv' },
  { type: 'application/ogg', extension: '.ogx' },
  { type: 'application/pdf', extension: '.pdf' },
  { type: 'application/vnd.ms-powerpoint', extension: '.ppt' },
  { type: 'application/x-rar-compressed', extension: '.rar' },
  { type: 'application/rtf', extension: '.rtf' },
  { type: 'application/x-sh', extension: '.sh' },
  { type: 'image/svg+xml', extension: '.svg' },
  { type: 'application/x-shockwave-flash', extension: '.swf' },
  { type: 'application/x-tar', extension: '.tar' },
  { type: 'image/tiff', extension: '.tiff' },
  { type: 'font/ttf', extension: '.ttf' },
  { type: 'application/vnd.visio', extension: '.vsd' },
  { type: 'audio/x-wav', extension: '.wav' },
  { type: 'audio/webm', extension: '.weba' },
  { type: 'video/webm', extension: '.webm' },
  { type: 'image/webp', extension: '.webp' },
  { type: 'font/woff', extension: '.woff' },
  { type: 'font/woff2', extension: '.woff2' },
  { type: 'application/xhtml+xml', extension: '.xhtml' },
  { type: 'application/vnd.ms-excel', extension: '.xls' },
  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx' },
  { type: 'application/xml', extension: '.xml' },
  { type: 'vnd.mozilla.xul+xml', extension: '.xul' },
  { type: 'application/zip', extension: '.zip' },
  { type: 'video/3gpp', extension: '.3gp' },
  { type: 'video/3gpp2', extension: '.3g2' },
  { type: 'application/x-7z-compressed', extension: '.7z' }
];

const dorkList = [
  {
    dork_input: 'content',
    dork: 'content'
  },
  {
    dork_input: 'body',
    dork: 'content'
  },
  {
    dork_input: 'url',
    dork: 'url'
  },
  {
    dork_input: 'title',
    dork: 'title'
  },
  {
    dork_input: 'intitle',
    dork: 'title'
  },
  {
    dork_input: 'site',
    dork: 'site_readable'
  },
  {
    dork_input: 'domain',
    dork: 'site_readable'
  },
  {
    dork_input: 'onion',
    dork: 'site_readable'
  },
  {
    dork_input: 'site_readable',
    dork: 'site_readable'
  },
  {
    dork_input: 'updated',
    dork: 'updated_at'
  },
  {
    dork_input: 'update',
    dork: 'updated_at'
  },
  {
    dork_input: 'last_update',
    dork: 'updated_at'
  },
  {
    dork_input: 'updated_at',
    dork: 'updated_at'
  },
  {
    dork_input: 'contenttype',
    dork: 'mime'
  },
  {
    dork_input: 'content_type',
    dork: 'mime'
  },
  {
    dork_input: 'mime',
    dork: 'mime'
  },
  {
    dork_input: 'has_screenshot',
    dork: 'mime'
  },
  {
    dork_input: 'have_screenshot',
    dork: 'mime'
  },
  {
    dork_input: 'with_screenshot',
    dork: 'mime'
  },
  {
    dork_input: 'yes_screenshot',
    dork: 'mime'
  },
  {
    dork_input: 'screenshot_exist',
    dork: 'mime'
  },
  {
    dork_input: 'screenshot',
    dork: 'mime'
  },
  {
    dork_input: 'text_size',
    dork: 'text_size'
  },
  {
    dork_input: 'content_size',
    dork: 'text_size'
  },
  {
    dork_input: 'size',
    dork: 'text_size'
  },
  {
    dork_input: 'text_mb',
    dork: 'text_size'
  },
  {
    dork_input: 'mb_text',
    dork: 'text_size'
  },
  {
    dork_input: 'file_size',
    dork: 'size'
  },
  {
    dork_input: 'raw_size',
    dork: 'size'
  },
  {
    dork_input: 'size',
    dork: 'size'
  },
  {
    dork_input: 'file_mb',
    dork: 'size'
  },
  {
    dork_input: 'mb_raw',
    dork: 'size'
  },
  {
    dork_input: 'text',
    dork: 'mime'
  },
  {
    dork_input: 'web',
    dork: 'mime'
  }
];

const languagesAndId = [
  {
    language_id: 'af',
    language: 'Afrikaans'
  },
  {
    language_id: 'sq',
    language: 'Albanian'
  },
  {
    language_id: 'ar',
    language: 'Arabic'
  },
  {
    language_id: 'bn',
    language: 'Bengali'
  },
  {
    language_id: 'bg',
    language: 'Bulgarian'
  },
  {
    language_id: 'ca',
    language: 'Catalan'
  },
  {
    language_id: 'zh',
    language: 'Chinese'
  },
  {
    language_id: 'zh-cn',
    language: 'Chinese (PRC)'
  },
  {
    language_id: 'zh-tw',
    language: 'Chinese (Taiwan)'
  },
  {
    language_id: 'hr',
    language: 'Croatian'
  },
  {
    language_id: 'cs',
    language: 'Czech'
  },
  {
    language_id: 'da',
    language: 'Danish'
  },
  {
    language_id: 'nl',
    language: 'Dutch'
  },
  {
    language_id: 'en',
    language: 'English'
  },
  {
    language_id: 'et',
    language: 'Estonian'
  },
  {
    language_id: 'fi',
    language: 'Finnish'
  },
  {
    language_id: 'fr',
    language: 'French'
  },
  {
    language_id: 'ga',
    language: 'Galician'
  },
  {
    language_id: 'de',
    language: 'German'
  },
  {
    language_id: 'el',
    language: 'Greek'
  },
  {
    language_id: 'gu',
    language: 'Gujarati'
  },
  {
    language_id: 'he',
    language: 'Hebrew'
  },
  {
    language_id: 'hi',
    language: 'Hindi'
  },
  {
    language_id: 'hu',
    language: 'Hungarian'
  },
  {
    language_id: 'id',
    language: 'Indonesian'
  },
  {
    language_id: 'it',
    language: 'Italian'
  },
  {
    language_id: 'ja',
    language: 'Japanese'
  },
  {
    language_id: 'kn',
    language: 'Kannada'
  },
  {
    language_id: 'ko',
    language: 'Korean'
  },
  {
    language_id: 'lv',
    language: 'Latvian'
  },
  {
    language_id: 'lt',
    language: 'Lithuanian'
  },
  {
    language_id: 'mk',
    language: 'Macedonian'
  },
  {
    language_id: 'ml',
    language: 'Malayalam'
  },
  {
    language_id: 'mr',
    language: 'Marathi'
  },
  {
    language_id: 'ne',
    language: 'Nepali'
  },
  {
    language_id: 'no',
    language: 'Norwegian'
  },
  {
    language_id: 'pa',
    language: 'Panjabi'
  },
  {
    language_id: 'fa',
    language: 'Persian'
  },
  {
    language_id: 'pl',
    language: 'Polish'
  },
  {
    language_id: 'pt',
    language: 'Portuguese'
  },
  {
    language_id: 'ro',
    language: 'Romanian'
  },
  {
    language_id: 'ru',
    language: 'Russian'
  },
  {
    language_id: 'sk',
    language: 'Slovak'
  },
  {
    language_id: 'sl',
    language: 'Slovenian'
  },
  {
    language_id: 'so',
    language: 'Somali'
  },
  {
    language_id: 'es',
    language: 'Spanish'
  },
  {
    language_id: 'sw',
    language: 'Swahili'
  },
  {
    language_id: 'sv',
    language: 'Swedish'
  },
  {
    language_id: 'tl',
    language: 'Tagalog'
  },
  {
    language_id: 'ta',
    language: 'Tamil'
  },
  {
    language_id: 'te',
    language: 'Telugu'
  },
  {
    language_id: 'th',
    language: 'Thai'
  },
  {
    language_id: 'tr',
    language: 'Turkish'
  },
  {
    language_id: 'uk',
    language: 'Ukrainian'
  },
  {
    language_id: 'ur',
    language: 'Urdu'
  },
  {
    language_id: 'vi',
    language: 'Vietnamese'
  }
];

export function getHumanReadableDate(timestamp) {
  const date = moment(Number(timestamp)).format('D/M/YYYY HH:mm');
  return date + 'h';
}

export function dateFromMiliseconds(stringMs) {
  if (stringMs.indexOf('.') < 0 && stringMs.indexOf('/') < 0) {
    const date = moment(Number(stringMs)).format('D/M/YYYY');
    return date + 'h';
  } else {
    return stringMs;
  }
}

export function getHumanReadableDateWithSeconds(timestamp) {
  const date = moment(timestamp).format('D/M/YYYY HH:mm:ss');
  return date + 'h';
}

export function ellipseUrl(url, shown_characters = 25) {
  if (url && url.length > shown_characters) {
    let sp;
    let characters_left;
    let characters_right;
    sp = url.split('');
    characters_left = Math.floor(shown_characters / 2) - 3;
    characters_right = Math.floor(shown_characters / 2);
    return sp.slice(0, characters_left).join('') + '...' + sp.slice(sp.length - characters_right, sp.length).join('');
  } else {
    return url;
  }
}

export function ellipseText(text, shown_characters = 25) {
  if (text && text.length > shown_characters) {
    return text.substr(0, shown_characters) + '...';
  } else {
    return text;
  }
}

export function capitalize(text) {
  if (text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
  } else {
    return '--';
  }
}

export function ellipseUrlNew(url, shown_characters = 25) {
  if (url && url.length > shown_characters * 2 + 3) {
    const htmlRegex = new RegExp(/<[^>]+>/gi);
    let sp;
    let characters_left;
    let characters_right;
    const removeTags = url.replace(htmlRegex, '');
    sp = removeTags.split('');
    characters_left = Math.floor(shown_characters);
    characters_right = Math.floor(shown_characters);
    return sp.slice(0, characters_left).join('') + '...' + sp.slice(sp.length - characters_right, sp.length).join('');
  } else {
    return url;
  }
}

export function getExtensions(mime) {
  function mimeToFind(entry) {
    return entry.type === mime;
  }

  const filterByType = mimeTipes.find(mimeToFind);
  mime = filterByType.extension;
  return mime;
}

export function getParamType(param) {
  const filterByParam = paramTypes.find((l) => {
    return l.type === param || l.name === param;
  });
  return filterByParam.name;
}

export function getFileType(mime) {
  function FileToFind(entry) {
    return entry.extension === mime;
  }

  let filterByExtension = mimeTipes.find(FileToFind);
  if (filterByExtension === undefined) {
    filterByExtension = { type: 'text/html', extension: '.html' };
    mime = filterByExtension.type;
  } else {
    mime = filterByExtension.type;
  }
  return mime;
}

export function handleError(error: Error | ErrorEvent | HttpErrorResponse | any) {
  let errMsg: string;
  // if (typeof error === 'string') {
  //   error = JSON.parse(error);
  // }
  if (error instanceof ErrorEvent) {
    // client-side error
    errMsg = `${error.error.message}`;
  } else if (error instanceof HttpErrorResponse) {
    if (error.error && error.error.field) {
      errMsg = `${error.status} - ${error.error.field}`;
    } else if (error.error && error.error.message) {
      errMsg = `${error.status} - ${error.error.message}`;
    } else {
      errMsg = `${error.status || error.error.httpCode} - Something went wrong`;
    }
  } else if (error.field) {
    errMsg = error.field;
  } else if (error.message) {
    errMsg = error.message;
  } else {
    errMsg = error.toString();
  }
  console.error(errMsg);
  return throwError(errMsg);
}

export function getStatusBoolean(data) {
  return data ? 'Active' : 'Inactive';
}

export function SHA256(s) {
  const chrsz = 8;
  const hexcase = 0;

  function safe_add(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function S(X, n) {
    return (X >>> n) | (X << (32 - n));
  }

  function R(X, n) {
    return X >>> n;
  }

  function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
  }

  function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }

  function Sigma0256(x) {
    return S(x, 2) ^ S(x, 13) ^ S(x, 22);
  }

  function Sigma1256(x) {
    return S(x, 6) ^ S(x, 11) ^ S(x, 25);
  }

  function Gamma0256(x) {
    return S(x, 7) ^ S(x, 18) ^ R(x, 3);
  }

  function Gamma1256(x) {
    return S(x, 17) ^ S(x, 19) ^ R(x, 10);
  }

  function core_sha256(m, l) {
    const K = new Array(
      0x428a2f98,
      0x71374491,
      0xb5c0fbcf,
      0xe9b5dba5,
      0x3956c25b,
      0x59f111f1,
      0x923f82a4,
      0xab1c5ed5,
      0xd807aa98,
      0x12835b01,
      0x243185be,
      0x550c7dc3,
      0x72be5d74,
      0x80deb1fe,
      0x9bdc06a7,
      0xc19bf174,
      0xe49b69c1,
      0xefbe4786,
      0xfc19dc6,
      0x240ca1cc,
      0x2de92c6f,
      0x4a7484aa,
      0x5cb0a9dc,
      0x76f988da,
      0x983e5152,
      0xa831c66d,
      0xb00327c8,
      0xbf597fc7,
      0xc6e00bf3,
      0xd5a79147,
      0x6ca6351,
      0x14292967,
      0x27b70a85,
      0x2e1b2138,
      0x4d2c6dfc,
      0x53380d13,
      0x650a7354,
      0x766a0abb,
      0x81c2c92e,
      0x92722c85,
      0xa2bfe8a1,
      0xa81a664b,
      0xc24b8b70,
      0xc76c51a3,
      0xd192e819,
      0xd6990624,
      0xf40e3585,
      0x106aa070,
      0x19a4c116,
      0x1e376c08,
      0x2748774c,
      0x34b0bcb5,
      0x391c0cb3,
      0x4ed8aa4a,
      0x5b9cca4f,
      0x682e6ff3,
      0x748f82ee,
      0x78a5636f,
      0x84c87814,
      0x8cc70208,
      0x90befffa,
      0xa4506ceb,
      0xbef9a3f7,
      0xc67178f2
    );
    const HASH = new Array(
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19
    );
    const W = new Array(64);
    let a, b, c, d, e, f, g, h, i, j;
    let T1, T2;

    m[l >> 5] |= 0x80 << (24 - (l % 32));
    m[(((l + 64) >> 9) << 4) + 15] = l;

    for (let i = 0; i < m.length; i += 16) {
      a = HASH[0];
      b = HASH[1];
      c = HASH[2];
      d = HASH[3];
      e = HASH[4];
      f = HASH[5];
      g = HASH[6];
      h = HASH[7];

      for (let j = 0; j < 64; j++) {
        if (j < 16) W[j] = m[j + i];
        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
        T2 = safe_add(Sigma0256(a), Maj(a, b, c));

        h = g;
        g = f;
        f = e;
        e = safe_add(d, T1);
        d = c;
        c = b;
        b = a;
        a = safe_add(T1, T2);
      }

      HASH[0] = safe_add(a, HASH[0]);
      HASH[1] = safe_add(b, HASH[1]);
      HASH[2] = safe_add(c, HASH[2]);
      HASH[3] = safe_add(d, HASH[3]);
      HASH[4] = safe_add(e, HASH[4]);
      HASH[5] = safe_add(f, HASH[5]);
      HASH[6] = safe_add(g, HASH[6]);
      HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
  }

  function str2binb(str) {
    const bin = Array();
    const mask = (1 << chrsz) - 1;
    for (let i = 0; i < str.length * chrsz; i += chrsz) {
      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - (i % 32));
    }
    return bin;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  function binb2hex(binarray) {
    const hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str +=
        hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) +
        hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
    }
    return str;
  }

  s = Utf8Encode(s);
  return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}

export function getLanguageFromId(id, payload) {
  if (!payload || !payload.length) {
    return;
  }
  const filterById = payload.find((l) => {
    return l.language_id == id || l.language == id;
  });
  return filterById.language;
}

export function getIdFromLanguage(language, payload) {
  const filterById = payload.find((l) => {
    return l.language_id == language || l.language == language;
  });
  return filterById.language_id;
}

export const defaultColorsRGB = [
  'rgba(244,67,54,1)',
  'rgba(233,30,99,1)',
  'rgba(156,39,176,1)',
  'rgba(103,58,183,1)',
  'rgba(63,81,181,1)',
  'rgba(33,150,243,1)',
  'rgba(3,169,244,1)',
  'rgba(0,188,212,1)',
  'rgba(0,150,136,1)',
  'rgba(76,175,80,1)',
  'rgba(139,195,74,1)',
  'rgba(192,202,51,1)',
  'rgba(251,192,45,1)',
  'rgba(255,193,7,1)',
  'rgba(255,152,0,1)',
  'rgba(255,87,34,1)',
  'rgba(121,85,72,1)',
  'rgba(158,158,158,1)',
  'rgba(96,125,139,1)',
  'rgba(0,138,0,1)',
  'rgba(0,80,239,1)',
  'rgba(170,0,255,1)',
  'rgba(227,200,0,1)',
  'rgba(109,135,100,1)',
  'rgba(216,0,115,1)',
  'rgba(238,158,158,1)',
  'rgba(100,158,158,1)',
  'rgba(238,238,158,1)',
  'rgba(238,238,238,1)'
];

export function setColors(decimalColor, returnType = 'hexa') {
  let backgroundColor, textColor, borderColor;
  const defaultColors = [
    [244, 67, 54],
    [233, 30, 99],
    [156, 39, 176],
    [103, 58, 183],
    [63, 81, 181],
    [33, 150, 243],
    [3, 169, 244],
    [0, 188, 212],
    [0, 150, 136],
    [76, 175, 80],
    [139, 195, 74],
    [192, 202, 51],
    [251, 192, 45],
    [255, 193, 7],
    [255, 152, 0],
    [255, 87, 34],
    [121, 85, 72],
    [158, 158, 158],
    [96, 125, 139],
    [0, 138, 0],
    [0, 80, 239],
    [170, 0, 255],
    [227, 200, 0],
    [109, 135, 100],
    [216, 0, 115],
    [238, 158, 158],
    [100, 158, 158],
    [238, 238, 158],
    [238, 238, 238],
    [255, 255, 255]
  ];

  let index = 0;
  let minimunDistance = 1000;
  let closestColor = [];
  const colorObject = { background: '', color: '', weight: '' };
  let border = decimalColor.toString(16);
  if (border.length < 6) {
    const zerosNum = 6 - border.length;
    for (let j = 0; j < zerosNum; j++) {
      border = '0' + border;
    }
  }
  border = border.match(/.{1,2}/g);
  border = [parseInt(border[0], 16), parseInt(border[1], 16), parseInt(border[2], 16)];
  defaultColors.forEach((color) => {
    const distance = euclideanDistance(border, color);
    if (distance <= minimunDistance) {
      minimunDistance = distance;
      closestColor = color;
    }
    if (index === 29) {
      if (returnType === 'rgb') {
        colorObject.background = 'rgb(' + closestColor.join(',') + ')';
        if (closestColor.join(',') === '255,255,255' || closestColor.join(',') === '238,238,238') {
          colorObject.color = '#000';
          colorObject.weight = '500';
        } else {
          colorObject.color = '#FFF';
          colorObject.weight = '500';
        }
      } else if (returnType === 'hexa') {
        colorObject.background =
          '#' +
          closestColor
            .map((el) => {
              return el.toString(16);
            })
            .join('');
        colorObject.color = decimalColor.toString(16);
      }
    }
    index += 1;
  });
  return colorObject;
}

function euclideanDistance(c1, c2) {
  let i = 0;
  let d = 0;

  for (i = 0; i < c1.length; i++) {
    d += (c1[i] - c2[i]) * (c1[i] - c2[i]);
  }
  return Math.sqrt(d);
}

export function getDorksFromInput(dork) {
  function DorkToFind(entry) {
    return entry.dork_input === dork;
  }

  let filterInput = dorkList.find(DorkToFind);
  if (filterInput === undefined) {
    filterInput = {
      dork_input: 'Bad_Dork',
      dork: 'Bad_Dork'
    };
    return filterInput.dork;
  } else {
    return filterInput.dork;
  }
}

export function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export function humanFileSize(size) {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return ((size / Math.pow(1024, i)).toFixed(2) as any) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function infiniteScroll(parcialArray, completeArray, event, num, page, scrollPercent) {
  if (parcialArray.length != completeArray.length) {
    const max = event.target.scrollHeight - event.target.offsetHeight;
    const actual = event.target.scrollTop;
    const percent = (1 - actual / max) * 100;
    if (percent < scrollPercent) {
      page += 1;
      parcialArray = parcialArray.concat(completeArray.slice(num * page, num * (page + 1)));
    }
  }
  return {
    parcialArray,
    page
  };
}

export function limitRender(array, num) {
  if (array && num) {
    array = array.slice(0, num);
    return array;
  }
  return [...array];
}

export function prettifyObject(toPrettify: {}) {
  let result = '<ul>';
  for (const key in toPrettify) {
    if (key === 'raw') {
      continue;
    }
    let element = '<li>' + key.replace(/_/g, ' ') + ':';
    if (toPrettify[key] === null) {
      element += ' null';
    } else if (typeof toPrettify[key] === 'object') {
      element += prettifyObject(toPrettify[key]);
    } else {
      element += ' ' + toPrettify[key].toString();
    }
    element += '</li>';
    result += element;
  }
  result += '</ul>';
  return result;
}

export function numberWithCommas(x) {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function quantityConvert(quantity) {
  return Math.abs(quantity)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const getEnvVars = () => {
  const envVars = {
    deployDate: '',
    origin: '',
    envLogotype: '',
    envFavicon: '',
    envTitle: ''
  };

  const browserWindow = window || {};
  const browserWindowEnv = browserWindow['__env'] || {};

  for (const key in browserWindowEnv) {
    if (browserWindowEnv.hasOwnProperty(key)) {
      envVars[key] = window['__env'][key];
    }
  }

  return envVars;
};

export function proccesLinkToUpdateRedirection(data, moduleId, orgId) {
  let description = data;
  description = proccessRelativeLink(description, moduleId, orgId);
  description = proccessAbsoluteLink(description, moduleId, orgId);
  description = proccessAbsoluteLinkForIndicators(description, moduleId, orgId);
  description = proccessAbsoluteLinkForLists(description, moduleId, orgId);
  return description;
}

export function proccessRelativeLink(description, moduleId, orgId) {
  return description.replace(/href="\/threat_context\/(.*)"/gi, (value, $1) => {
    return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/${$1}"`;
  });
}

export function proccessAbsoluteLink(description, moduleId, orgId) {
  return description.replace(
    /href="(http[s]*:\/\/[\w\.]+)*[\/]*#\/ui\/(labsintell|intelligence)\/([\w]+)\/details\/([\w-]+)"/gi,
    (value, $1, $2, $3, $4) => {
      if ($3 === 'campaigns') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/campaigns/${$4}"`;
      } else if ($3 === 'tools') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/tools/${$4}"`;
      } else if ($3 === 'malware') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/malwares/${$4}/summary"`;
      } else if ($3 === 'attack-patterns') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/attack-patterns/${$4}"`;
      } else if ($3 === 'cve') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/cves/${$4}"`;
      }
      return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/${$3}/${$4}"`;
    }
  );
}

export function proccessAbsoluteLinkForLists(description, moduleId, orgId) {
  return description.replace(
    /href="(http[s]*:\/\/[\w\.]+)*\/#\/ui\/(labsintell|intelligence)\/([\w]+)\/list([\w?=.:&;"]*)"/gi,
    (value, $1, $2, $3, $4) => {
      if ($3 === 'campaigns') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/campaigns${$4}"`;
      } else if ($3 === 'tools') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/tools${$4}"`;
      } else if ($3 === 'malware') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/malwares${$4}"`;
      } else if ($3 === 'attack-patterns') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/attack-patterns${$4}"`;
      } else if ($3 === 'cve') {
        return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/cves${$4}"`;
      }
      return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/${$3}s${$4}"`;
    }
  );
}

export function proccessAbsoluteLinkForIndicators(description, moduleId, orgId) {
  return description.replace(
    /href="(http[s]*:\/\/[\w\.]+)*\/#\/ui\/intelligence\/indicators\/([\w]+)\/details\/([\w\/\.:]+)"/gi,
    (value, $1, $2, $3) => {
      return `href="/dashboard/organizations/${orgId}/modules/${moduleId}/threat_context/indicators/${$2}/resource/${$3}"`;
    }
  );
}

export const copyToClipboard = (value) => {
  const listener = (e: ClipboardEvent) => {
    e.clipboardData.setData('text/plain', value);
    e.preventDefault();
  };

  document.addEventListener('copy', listener);
  document.execCommand('copy');
  document.removeEventListener('copy', listener);
};
export const convertToCSV = (items) => {
  return Papa.unparse(items, { quotes: true });
};

export function exportClientFile(content, fileTitle = 'export', type: 'csv' | 'json' = 'csv') {
  const fileType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'text/json;charset=utf-8;';

  const fileName = `${fileTitle}.${type}`;

  const blob = new Blob([content], { type: fileType });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function convertNumberToNumberWithK(value) {
  const _value = +value;
  if (_value < 10000) {
    return `${_value}`;
  } else if (_value < 50000) {
    return '+10k';
  } else if (_value < 100000) {
    return '+50k';
  } else if (_value < 1000000) {
    return '+100k';
  } else if (_value < 5000000) {
    return '+1M';
  } else if (_value < 10000000) {
    return '+5M';
  } else if (_value >= 10000000) {
    return '+10M';
  } else {
    return `${_value}`;
  }
}

export function getGranularity(since, to) {
  if (since && to) {
    const toEndOfDay = (d) => new Date(d).setHours(23, 59, 59, 59);
    const toInitialOfDay = (d) => new Date(d).setHours(0, 0, 0, 0);
    const sinceTimestamp = /\./.test(since) ? toInitialOfDay(since) : since;
    const toTimestamp = /\./.test(to) ? toEndOfDay(to) : to;

    const sinceDate = moment(parseInt(sinceTimestamp, 10));
    const toDate = moment(parseInt(toTimestamp, 10));
    const daysCount = toDate.diff(sinceDate, 'days');
    if (daysCount > 270) {
      const months = toDate.diff(sinceDate, 'months');
      return { limit: months + 1, granularity: 'MONTH' };
    } else if (daysCount > 60) {
      const weeks = toDate.diff(sinceDate, 'weeks');
      return { limit: weeks + 2, granularity: 'WEEK' };
    } else {
      return { limit: daysCount + 1 || 7, granularity: 'DAY' };
    }
  }
}
