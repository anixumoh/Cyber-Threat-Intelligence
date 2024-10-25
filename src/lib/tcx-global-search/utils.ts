enum LOGICAL_OPERATORS {
  AND = 'AND',
  OR = 'OR'
}

enum COMPARASION_OPERATORS {
  EQUALS = '=',
  STARTS_WITH = '^',
  ENDS_WITH = '$',
  CONTAINS = '~',
  GREATER_THAN = '>',
  GREATER_EQUAL_THAN = '>=',
  LESS_THAN = '<',
  LESS_EQUAL_THAN = '<='
}

export type LogicalQuery = {
  isLogical?: true;
  operation: LOGICAL_OPERATORS;
  subnodes: Query[];
};

export type ComparationQuery = {
  isLogical?: false;
  not: boolean;
  field: string;
  operation: COMPARASION_OPERATORS;
  value: string | number;
  type: 'BOOLEAN' | 'DATE' | 'CHOICE' | 'LIST' | 'RELATIONSHIP' | 'STRING';
};

export type Query = LogicalQuery | ComparationQuery;

const OPERATION_MAP: Record<COMPARASION_OPERATORS, string> = {
  [COMPARASION_OPERATORS.EQUALS]: ':',
  [COMPARASION_OPERATORS.STARTS_WITH]: ':^',
  [COMPARASION_OPERATORS.ENDS_WITH]: ':$',
  [COMPARASION_OPERATORS.CONTAINS]: ':~',
  [COMPARASION_OPERATORS.GREATER_THAN]: ':>',
  [COMPARASION_OPERATORS.GREATER_EQUAL_THAN]: ':>=',
  [COMPARASION_OPERATORS.LESS_THAN]: ':<',
  [COMPARASION_OPERATORS.LESS_EQUAL_THAN]: ':<='
};

function isLogical(operation: LOGICAL_OPERATORS | COMPARASION_OPERATORS) {
  return LOGICAL_OPERATORS.OR === operation.toUpperCase() || LOGICAL_OPERATORS.AND === operation.toUpperCase();
}

function getLogicalOperation(operation: LOGICAL_OPERATORS) {
  return `<span class="text-orange-300">${operation}</span>`;
}

function getHtmlValue(value: string | number, type: ComparationQuery['type']) {
  if (type === 'STRING') {
    return `<span class="text-green-700 dark:text-green-300">${value}</span>`;
  } else if (type === 'BOOLEAN') {
    return `<span class="text-blue-300">${value ? 'TRUE' : 'FALSE'}</span>`;
  }
  return `<span class="text-blue-300">${value}</span>`;
}

export function queryToHTML(query: Query, deep = 0) {
  if (!query) return '';
  let result = [];

  query.isLogical = isLogical(query.operation);

  if (query.isLogical) {
    const q = query.subnodes.map((q) => queryToHTML(q, deep + 1));
    let innerQuery = q.join(` ${getLogicalOperation(query.operation)} `);
    if (deep) {
      innerQuery = `<span class="text-purple-400">(</span> ${innerQuery} <span class="text-purple-400">)</span>`;
    }
    result.push(innerQuery);
  } else if (query.isLogical === false) {
    const queryNot = query.not ? 'NOT ' : '';
    const queryField = query.field;
    const queryOperation = query.operation;
    const value = getHtmlValue(query.value, query.type);
    const qs = `${queryNot}${queryField} ${queryOperation} ${value}`;
    result.push(qs);
  }

  return result.flat().join(' ');
}

export function queryToDorks(query: Query) {
  const actor = queryFieldToDork(query, 'actor');
  const campaign = queryFieldToDork(query, 'campaign');
  const tool = queryFieldToDork(query, 'tool');
  return {
    actor,
    campaign,
    tool
  };
}

function valueTransform(value: string | number, type: ComparationQuery['type']) {
  if (type === 'BOOLEAN') {
    return value;
  } else if (type === 'DATE') {
    return String(value).split('/').reverse().map(x => x.padStart(2, '0')).join('-');
  }
  return `"${value}"`;
}

function queryFieldToDork(query: Query, field: 'actor' | 'campaign' | 'tool', deep = 0): string {
  const result = '';
  query.isLogical = isLogical(query.operation);

  if (query.isLogical) {
    const results = query.subnodes.map((q) => queryFieldToDork(q, field, deep + 1));
    let qs = results.filter(Boolean).join(` ${query.operation} `);
    if (deep && qs) {
      qs = `(${qs})`;
    }
    return qs;
  } else if (query.isLogical === false) {
    if (!query.field.startsWith(field)) return '';
    const fieldDotted = `${field}.`;
    const not = query.not ? 'NOT ' : '';
    const queryField = query.field.replace(fieldDotted, '');
    const operation = OPERATION_MAP[query.operation] ?? query.operation;
    const value = valueTransform(query.value, query.type);
    const qs = `${not}${queryField}${operation}${value}`;
    return qs;
  }
  return '';
}
