import languagesStore from '$stores/languages';
import notifications from '$stores/notification';
import userStore from '$stores/user';
import type { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { get } from 'svelte/store';

export function setColors(decimalColor, returnType = 'hexa') {
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
      border = `0${border}`;
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
        colorObject.background = `rgb(${closestColor.join(',')})`;
        const isBlack = closestColor.join(',') === '255,255,255' || closestColor.join(',') === '238,238,238';
        colorObject.color = isBlack ? '#000' : '#FFF';
        colorObject.weight = '500';
      } else if (returnType === 'hexa') {
        colorObject.background = `#${closestColor.map((el) => el.toString(16)).join('')}`;
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

export function getHumanReadableDate(timestamp: string | number | Date | dayjs.Dayjs, defaultValue = '-') {
  if (timestamp) {
    const date = dayjs?.tz(timestamp);
    if (date?.isValid()) {
      return `${date.format('D/M/YYYY HH:mm')}h`;
    }
  }
  return defaultValue;
}

export function getHumanReadableDateWithSeconds(timestamp: string | number | Date | dayjs.Dayjs) {
  const date = dayjs?.tz(timestamp);
  if (date?.isValid()) {
    return `${date.format('D/M/YYYY HH:mm:ss')}h`;
  }
  return '-';
}

export function formatDate(value: string) {
  try {
    return dayjs(value).format('D/M/YYYY');
  } catch (error) {
    return '-';
  }
}

export function ellipseText(text, shown_characters = 25) {
  if (text && text.length > shown_characters) {
    return text.substr(0, shown_characters) + '...';
  } else {
    return text;
  }
}

export function ellipseUrl(url: string, shownCharacters = 25) {
  if (url?.length > shownCharacters) {
    const sp = url.split('');
    const charactersLeft = Math.floor(shownCharacters / 2) - 3;
    const charactersRight = Math.floor(shownCharacters / 2);
    return sp.slice(0, charactersLeft).join('') + '...' + sp.slice(sp.length - charactersRight, sp.length).join('');
  } else {
    return url;
  }
}

export function getLanguageFromId(id: string) {
  const languages = get(languagesStore);
  if (!languages || !languages.length) {
    return;
  }
  const filterById = languages.find((l) => l.language_id === id);
  return filterById.language;
}

// verify size of the files (< 20mb)
export function beforeUpload(file: File, size = 20) {
  return file.size / 1024 / 1024 < size;
}

export function getSinceOrToDate(date: string | dayjs.Dayjs | Date, isSince = true) {
  const timezone = get(userStore).timezone;
  const d = dayjs(date).tz(timezone, true);
  if (isSince) return d.startOf('day');
  return d.endOf('day');
}

export function scrollToTop() {
  // TODO, offset?
  window.scrollTo({ top: 0, behavior: 'smooth' });
  (document.activeElement as HTMLElement)?.blur();
}

export function handle429Response(response: AxiosResponse) {
  if (response?.status !== 429) return;
  let subtitle =
    'This happens when you exceed the number of allowed requests to our API for a certain period of time. ';

  if (response.headers['Retry-After']) {
    subtitle += `The backend will be ready to attend your request in ${response.headers['Retry-After']} seconds`;
  }

  notifications.notify({
    id: 'too-many-requests-429',
    kind: 'warning',
    title: 'Too Many Requests',
    subtitle,
    timeout: 10_000
  });
}

export function getPageOptions(page: number, totalItems: number, pageSize: number) {
  const options: { value: number; text: string; disabled?: boolean }[] = [];
  const rangoInicial = Math.max(1, page - 10);
  const totalPages = Math.ceil(totalItems / pageSize);
  const rangoFinal = Math.min(totalPages, page + 10);
  const numberFormat = new Intl.NumberFormat();

  if (page > 11) {
    options.push({ value: 1, text: '1' });
    if (page > 12) {
      options.push({ value: null, text: '...', disabled: true });
    }
  }

  for (let p = rangoInicial; p <= rangoFinal; p++) {
    options.push({ value: p, text: numberFormat.format(p) });
  }

  if (page < totalPages - 10) {
    if (page < totalPages - 11) {
      options.push({ value: null, text: '...', disabled: true });
    }
    options.push({ value: totalPages, text: numberFormat.format(totalPages) });
  }

  return options;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getObjectValueByDottedKey(obj: Record<string, any>, key: string) {
  if (!obj || !key) return;

  const keyParts = key.split('.');

  if (keyParts.length > 1) {
    return getObjectValueByDottedKey(obj[keyParts[0]], keyParts.slice(1).join('.'));
  }

  return obj[keyParts[0]];
}

export function downloadFile(fileName: string, data: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const csvUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = csvUrl;
  link.download = fileName;
  link.click();
  link.remove();
}

export function dataToCsv(data: Record<string, any>[]) {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      Object.values(row)
        .map((val) => {
          let value = val;
          if (Array.isArray(value)) {
            value = value.join(',');
          }
          if (typeof value === 'string') {
            return `"${value.replace('"', '\\"')}"`;
          }
          return value;
        })
        .join(',')
    )
  ].join('\n');

  return csv;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
