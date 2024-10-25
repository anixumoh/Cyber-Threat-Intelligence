export function instanceHeader(
  key: string,
  title = '',
  hidden = false,
  isTemplate = false,
  hasDetail = false,
  className = null,
  sort = undefined
) {
  return {
    title,
    key,
    hidden,
    hasDetail,
    isTemplate,
    ...(sort ? { sort } : {}),
    ...(className ? { class: className } : {})
  } as any;
}

export function instanceHeaderMin(key: string, title = '', hidden = false, isTemplate = false, className = null) {
  return {
    title,
    key,
    hidden,
    isTemplate,
    ...(className ? { class: className } : {})
  };
}
