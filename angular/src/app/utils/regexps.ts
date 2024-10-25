import { emailRegexp } from './validators';

export const regexSearchWord = new RegExp(
  /^["][a-zA-Z0-9\u00C0-\u017FñÑ_#@.,?¿¡·:;+%$~&¬\\\/\-\s]{1,63}["]$|^(?!")[a-zA-Z0-9\u00C0-\u017FñÑ_#@.,?¿¡·:;+%$~&¬\\\/\-\s]{1,63}$/gm
);

export const regexArabic = new RegExp(
  /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufbc1]|[\ufbd3-\ufd3f]|[\ufd50-\ufd8f]|[\ufd92-\ufdc7]|[\ufe70-\ufefc]|[\uFDF0-\uFDFD]/
);

export const regexGreek = new RegExp(/[Ͱ-Ͼἀ-῾]|\ud800[\udd40-\udd8e]|\ud834[\ude00-\ude4e]/);

export const regexJapanese = new RegExp(
  /[\u3000-\u303f]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uff00-\uff9f]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/
);

export const regexKorean = new RegExp(/[\u3131-\uD79D]/);

export const regexSpace = new RegExp(/^[^ ]+$/g);

export const regexWithOutQuotes = new RegExp(/^[^'"]*$/);
export const regexUrlSpaces = new RegExp(
  /^(http(?:s)?|ftp(?:s)?):\/\/(?:[\w-]+\.)([\w-]{1,63})(?:\\.(?:\\w{3}|\w{2}))(?:$|\/)|[_~:/?#\[\]@!$&'()+,;=%\s]|file:\/\//i
);

export const regexEmail = new RegExp(emailRegexp);

export const regexCyrilic = new RegExp(/[a-z\u0400-\u04FF]/u);

export const regexChinese = new RegExp(/[\u3000\u3400-\u4DBF\u4E00-\u9FFF]/u);

export const domainRegex = new RegExp(
  '^' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!10(?:\\.\\d{1,3}){3})' +
    '(?!127(?:\\.\\d{1,3}){3})' +
    '(?!169\\.254(?:\\.\\d{1,3}){2})' +
    '(?!192\\.168(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // IPv6 RegEx - http://stackoverflow.com/a/17871737/273668
    '\\[(' +
    '([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|' + // 1:2:3:4:5:6:7:8
    '([0-9a-fA-F]{1,4}:){1,7}:|' + // 1::                              1:2:3:4:5:6:7::
    '([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|' + // 1::8             1:2:3:4:5:6::8  1:2:3:4:5:6::8
    '([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|' + // 1::7:8           1:2:3:4:5::7:8  1:2:3:4:5::8
    '([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|' + // 1::6:7:8         1:2:3:4::6:7:8  1:2:3:4::8
    '([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|' + // 1::5:6:7:8       1:2:3::5:6:7:8  1:2:3::8
    '([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|' + // 1::4:5:6:7:8     1:2::4:5:6:7:8  1:2::8
    '[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|' + // 1::3:4:5:6:7:8   1::3:4:5:6:7:8  1::8
    ':((:[0-9a-fA-F]{1,4}){1,7}|:)|' + // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8 ::8       ::
    'fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|' + // fe80::7:8%eth0   fe80::7:8%1     (link-local IPv6 addresses with zone index)
    '::(ffff(:0{1,4}){0,1}:){0,1}' +
    '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}' +
    '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|' + // ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
    '([0-9a-fA-F]{1,4}:){1,4}:' +
    '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}' +
    '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])' + // 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
    ')\\]' +
    '|' +
    'localhost' +
    '|' +
    // host name
    '(?:xn--[a-z0-9\\-]{1,59}|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))' +
    // domain name
    '(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))*' +
    // TLD identifier
    '(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff]{2,63})))' +
    ')' +
    // port number
    '(?::\\d{2,5})?' +
    // resource path
    '(?:/[^\\s]*)?' +
    '$',
  'i'
);
