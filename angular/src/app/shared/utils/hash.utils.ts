export const isHash = (value: string): boolean => {
  // MD5, SHA1, SHA256, SHA512
  return /^(?=[a-f0-9])(?:.{32}|.{40}|.{64}|.{128})$/i.test(value);
};

export const isMD5 = (value: string): boolean => {
  return /^(?=[a-f0-9])(?:.{32})$/i.test(value);
};

export const isSHA1 = (value: string): boolean => {
  return /^(?=[a-f0-9])(?:.{40})$/i.test(value);
};

export const isSHA256 = (value: string): boolean => {
  return /^(?=[a-f0-9])(?:.{64})$/i.test(value);
};

export const isSHA512 = (value: string): boolean => {
  return /^(?=[a-f0-9])(?:.{128})$/i.test(value);
};

export const isIp = (value: string): boolean => {
  return /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(value);
};

export const isDomain = (value: string): boolean => {
  return /^[a-zA-Z0-9._-]+\\[a-zA-Z0-9.-]$/.test(value);
};

export const isURL = (value: string): boolean => {
  return /^https?|ftp\:\/\/[^\/\s]+(\/.*)?$/.test(value);
};

export const extractHashFromDorkText = (value: string): string => {
  return value.replace(/.*:"(.*)"/, (fullValue, captureGroup1) => {
    return captureGroup1;
  });
};

export const extractPosibleHashFromQueryParams = params => {
  if (params.dork) {
    const isSearchingByHash = /md5:|sha1:|sha256:|sha512:/.test(params.dork);
    if (isSearchingByHash) {
      const possibleHash = extractHashFromDorkText(params.dork);
      if (isHash(possibleHash)) {
        return possibleHash;
      }
    }
  } else if (params.searchValue) {
    if (isHash(params.searchValue)) {
      return params.searchValue;
    }
  }
  return null;
};
