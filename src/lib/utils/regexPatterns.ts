export const regexUrl =
  /^(http:\/\/|https:\/\/)(www.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

const accentedCharacters = 'àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ-';
export const laxString = '.+@.+\\.[A-Za-z]{2}[A-Za-z]*';
export const emailRegexp = `[A-Z0-9a-z._%+-${accentedCharacters}]+@[A-Za-z0-9.-${accentedCharacters}]+\\.[A-Za-z]{2,}`;
export const phoneRegexp = '(^$|^(\\+\\s?[0-9]{2}[\\-\\.\\s]?)?([0-9][\\-\\.\\s]?){9,12}$)';
export const regexSpace = new RegExp(/^[^ ]+$/g);
export const regexWithOutQuotes = new RegExp(/^[^'"]*$/);
export const passwordRegex = /(?=^.{10,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*/;
export const passwordRegexNoMin = /((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*/;
export const regexUrlSpaces = new RegExp(
  /^(http(?:s)?|ftp(?:s)?):\/\/(?:[\w-]+\.)([\w-]{1,63})(?:\\.(?:\\w{3}|\w{2}))(?:$|\/)|[_~:/?#\[\]@!$&'()+,;=%\s]|file:\/\//i
);
export const domainRegex = '^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
export const validateDomainWithSubdomain = new RegExp(
  /^(http:\/\/|https:\/\/)?(?!www\b)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
);
export const regexPrefix = /^((http|https|ftp):\/\/)/;
export const regexDomain = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;

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
export const regexChinese = new RegExp(/[\u3000\u3400-\u4DBF\u4E00-\u9FFF]/u);

export const regexCyrilic = new RegExp(/[a-z\u0400-\u04FF]/u);

export const regexEmail = new RegExp(emailRegexp);
export const regexPhone = new RegExp(phoneRegexp);
