import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
import {
  COMPARASION_OPERATORS,
  LOGICAL_OPERATORS,
  VALUE_LESS_OPERATOR,
  type ComparationQuery,
  type ConfigQuery
} from './constants';

function buildValue(value: string | number, type: string, operator: COMPARASION_OPERATORS) {
  if (VALUE_LESS_OPERATOR.includes(operator)) return '';

  switch (type) {
    case 'DATE':
      return `DATE:${value}`;
    case 'NUMBER':
      return value;
    default:
      return `"${value}"`;
  }
}

export function convertQueryToCQL(query: ConfigQuery, keyTemplates: ExtradataKeyTemplate[], deep = 0) {
  if (!query) return '';
  const result = [];

  if (query.operation === LOGICAL_OPERATORS.OR || query.operation === LOGICAL_OPERATORS.AND) {
    const q = query.subnodes.map((q) => convertQueryToCQL(q, keyTemplates, deep + 1));
    let innerQuery = q.join(` ${query.operation} `);

    if (deep) {
      innerQuery = `( ${innerQuery} )`;
    }
    result.push(innerQuery);
  } else if (query.operation === LOGICAL_OPERATORS.NOT) {
    result.push(`${query.operation} ${convertQueryToCQL(query.subnodes[0], keyTemplates)}`);
  } else {
    const q = query as ComparationQuery;
    const keyTemplate = getKeyTemplate(q.keyPreset, keyTemplates);

    if (keyTemplate) {
      result.push(
        `${keyTemplate.keyPreset.key.path} ${q.operation} ${buildValue(
          q.value,
          keyTemplate.keyPreset.key.type,
          q.operation
        )}`
      );
    } else if (q.key) {
      result.push(`"${q.key.path}" ${q.operation} ${buildValue(q.value, q.key.type, q.operation)}`);
    } else {
      return '';
    }
  }

  return result.flat().join(' ').trim();
}

const getKey = (key: string) => `<span class="text-purple-700 dark:text-purple-300">${key}</span>`;
const getOperation = (operation: string) => `<span class="text-orange-700 dark:text-orange-300">${operation}</span>`;
const getLogicalOperation = (operation: LOGICAL_OPERATORS) =>
  operation === LOGICAL_OPERATORS.NOT
    ? `<span class="text-red-700 dark:text-red-300">${operation}</span>`
    : `<span class="text-orange-700 dark:text-orange-300">${operation}</span>`;
const getValue = (value: string | number, type: string) => {
  if (type === 'TEXT') {
    return `<span class="text-green-700 dark:text-green-300">${value}</span>`;
  }
  return `<span class="text-blue-700 dark:text-blue-300">${value}</span>`;
};

export function queryToHTML(query: ConfigQuery, keyTemplates: ExtradataKeyTemplate[], deep = 0) {
  if (!query) return '';
  const result = [];

  if (query.operation === LOGICAL_OPERATORS.OR || query.operation === LOGICAL_OPERATORS.AND) {
    const q = query.subnodes.map((q) => queryToHTML(q, keyTemplates, deep + 1));
    let innerQuery = q.join(` ${getLogicalOperation(query.operation)} `);

    if (deep) {
      innerQuery = `<span>(</span> ${innerQuery} <span>)</span>`;
    }
    result.push(innerQuery);
  } else if (query.operation === LOGICAL_OPERATORS.NOT) {
    result.push(`${getLogicalOperation(query.operation)} ${queryToHTML(query.subnodes[0], keyTemplates)}`);
  } else {
    const q = query as ComparationQuery;
    const keyTemplate = getKeyTemplate(q.keyPreset, keyTemplates);
    if (keyTemplate) {
      result.push(
        `${getKey(keyTemplate.keyPreset.key.path)} ${getOperation(q.operation)} ${getValue(
          q.value,
          keyTemplate.keyPreset.key.type
        )}`
      );
    } else if (q.key) {
      result.push(`${getKey(q.key.path)} ${getOperation(q.operation)} ${getValue(q.value, q.key.type)}`);
    } else {
      return '';
    }
  }

  return result.flat().join(' ');
}

function getKeyTemplate(keyPreset: string, keyTemplates: ExtradataKeyTemplate[]) {
  return keyTemplates?.find((kt) => kt.keyPreset.key.path === keyPreset || kt.keyPreset.name === keyPreset);
}

export function clearExtradata(query: ConfigQuery, keyTemplates: ExtradataKeyTemplate[] = []) {
  if ('subnodes' in query) {
    return {
      operation: query.operation,
      subnodes: query.subnodes.map((node) => clearExtradata(node, keyTemplates))
    };
  }
  if (query.keyPreset) {
    const keyTemplate = getKeyTemplate(query.keyPreset, keyTemplates);
    if (keyTemplate) {
      query.keyPreset = keyTemplate.keyPreset.name;
    }
  }
  return query;
}

export function getWarnings(query: ConfigQuery, keyTemplates: ExtradataKeyTemplate[], deep = 0) {
  if (!query) return [];
  const result = [];

  if (query.operation === LOGICAL_OPERATORS.OR || query.operation === LOGICAL_OPERATORS.AND) {
    const innerWarnings = query.subnodes.map((q) => getWarnings(q, keyTemplates, deep + 1));
    result.push(...innerWarnings);
  } else if (query.operation === LOGICAL_OPERATORS.NOT) {
    result.push(...getWarnings(query.subnodes[0], keyTemplates));
  } else {
    const q = query as ComparationQuery;
    const currentKeyTemplate = keyTemplates.find((kt) => kt.keyPreset.key.path === q.keyPreset);
    if (
      currentKeyTemplate &&
      currentKeyTemplate?.keyPreset.key.type !== q.key.type &&
      !VALUE_LESS_OPERATOR.includes(q.operation)
    ) {
      result.push(`Expected ${currentKeyTemplate.keyPreset.key.type} for "${q.key.path}", but found ${q.key.type}.`);
    }
  }
  return result.flat();
}
