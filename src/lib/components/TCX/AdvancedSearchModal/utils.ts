import type { TCXOptions } from '$lib/types/tcx';

export enum FIELD_TYPE {
  STRING = 'STRING',
  DATETIME = 'DATETIME',
  FLOAT = 'FLOAT',
  GENERICFIELD = 'GENERICFIELD',
  INTEGER = 'INTEGER',
  RELATIONSHIP = 'RELATIONSHIP',
  CHOICE = 'CHOICE',
  BOOLEAN = 'BOOLEAN'
}

export type Aggregator = 'AND' | 'OR';

export const OPERATORS = [
  {
    id: '=',
    text: 'is',
    type: [
      FIELD_TYPE.STRING,
      FIELD_TYPE.DATETIME,
      FIELD_TYPE.FLOAT,
      FIELD_TYPE.GENERICFIELD,
      FIELD_TYPE.INTEGER,
      FIELD_TYPE.RELATIONSHIP,
      FIELD_TYPE.CHOICE,
      FIELD_TYPE.BOOLEAN,
      undefined
    ]
  },
  {
    id: '^',
    text: 'starts with',
    type: [FIELD_TYPE.STRING, FIELD_TYPE.GENERICFIELD, FIELD_TYPE.RELATIONSHIP, FIELD_TYPE.CHOICE]
  },
  {
    id: '$',
    text: 'ends with',
    type: [FIELD_TYPE.STRING, FIELD_TYPE.GENERICFIELD, FIELD_TYPE.RELATIONSHIP, FIELD_TYPE.CHOICE]
  },
  {
    id: '~',
    text: 'contains',
    type: [FIELD_TYPE.STRING, FIELD_TYPE.GENERICFIELD, FIELD_TYPE.RELATIONSHIP, FIELD_TYPE.CHOICE]
  },
  {
    id: '>=',
    text: 'greater/equals',
    type: [FIELD_TYPE.DATETIME, FIELD_TYPE.FLOAT, FIELD_TYPE.INTEGER, FIELD_TYPE.GENERICFIELD]
  },
  {
    id: '>',
    text: 'greater than',
    type: [FIELD_TYPE.DATETIME, FIELD_TYPE.FLOAT, FIELD_TYPE.INTEGER, FIELD_TYPE.GENERICFIELD]
  },
  {
    id: '<=',
    text: 'less/equals',
    type: [FIELD_TYPE.DATETIME, FIELD_TYPE.FLOAT, FIELD_TYPE.INTEGER, FIELD_TYPE.GENERICFIELD]
  },
  {
    id: '<',
    text: 'less than',
    type: [FIELD_TYPE.DATETIME, FIELD_TYPE.FLOAT, FIELD_TYPE.INTEGER, FIELD_TYPE.GENERICFIELD]
  }
];

export type DorkFilter = {
  field: string | undefined;
  operator: string;
  value: string | number;
  aggregator?: Aggregator;
};

export function dorkFiltersToDork(dorks: DorkFilter[], tcxOptions: TCXOptions) {
  return dorks.reduce((acc, dork) => {
    const d = dorkToString(dork, tcxOptions);
    if (acc) {
      return `${acc} ${dork.aggregator} ${d}`;
    }
    return d;
  }, '');
}

function dorkToString(dork: DorkFilter, tcxOptions: TCXOptions) {
  const OPERATOR_MAP = {
    '=': ''
  };

  const fieldType = tcxOptions.dork_fields[dork.field].type.toUpperCase() as FIELD_TYPE;
  const field = dork.field;
  const operator = OPERATOR_MAP[dork.operator] ?? dork.operator;
  const hasQuotes = fieldType === FIELD_TYPE.STRING;
  const value = hasQuotes ? `"${dork.value}"` : dork.value;
  return `${field}:${operator}${value}`;
}

export function dorkToDorkFilters(dork: string, tcxOptions: TCXOptions) {
  if (!dork) return [];
  const parts = dork.split(/\s+(AND|OR)\s+/i);

  let dorks: DorkFilter[] = [];
  let aggregator: Aggregator = undefined;

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      const dork = dorkToDorkFilter(parts[i], tcxOptions, aggregator);
      dorks.push(dork);
    } else {
      aggregator = parts[i].toUpperCase() as Aggregator;
    }
  }

  return dorks.filter(Boolean);
}

function dorkToDorkFilter(dork: string, tcxOptions: TCXOptions, aggregator: Aggregator = undefined) {
  if (!dork) return;
  const [field, rest] = dork.split(':');

  const operator = OPERATORS.find((op) => rest.startsWith(op.id)) || OPERATORS[0];
  const operatorId = operator.id;

  const fieldType = tcxOptions.dork_fields?.[field]?.type.toUpperCase() as FIELD_TYPE;
  if (!fieldType) return;

  const operatorLength = operatorId === '=' ? 0 : operatorId.length;
  const rawValue = rest.slice(operatorLength).trim();

  const extractQuote = RegExp(/(?:"[^"]*"|^[^"]*$)/)
    .exec(rawValue)[0]
    .replace(/"/g, '');

  let value: string | number = extractQuote;

  if (fieldType === FIELD_TYPE.FLOAT || fieldType === FIELD_TYPE.INTEGER) {
    value = +value;
  }

  const dorkFitler: DorkFilter = {
    field,
    operator: operatorId,
    value
  };
  if (aggregator) dorkFitler.aggregator = aggregator;
  return dorkFitler;
}
