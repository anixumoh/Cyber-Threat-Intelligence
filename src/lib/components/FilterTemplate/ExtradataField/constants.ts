export enum LOGICAL_OPERATORS {
  NOT = 'NOT',
  AND = 'AND',
  OR = 'OR'
}
export const DEFAULT_LOGICAL_OPERATOR = LOGICAL_OPERATORS.AND;

export enum COMPARASION_OPERATORS {
  NOT_EQUALS = 'NOT_EQUALS',
  EQUALS = 'EQUALS',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  LOWER_THAN = 'LOWER_THAN',
  LOWER_THAN_EQUAL = 'LOWER_THAN_EQUAL',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  EXISTS = 'EXISTS'
}
export const VALUE_LESS_OPERATOR = [
  COMPARASION_OPERATORS.IS_NULL,
  COMPARASION_OPERATORS.IS_NOT_NULL,
  COMPARASION_OPERATORS.EXISTS
];
export const DEFAULT_COMPARASION_OPERATOR = COMPARASION_OPERATORS.EQUALS;

export enum KEY_TYPES {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  // DATE = 'DATE',
  // DATE_TIME = 'DATE_TIME',
  BOOLEAN = 'BOOLEAN'
}
export const DEFAULT_KEY_TYPES = KEY_TYPES.TEXT;

export type LogicalQuery = {
  operation: LOGICAL_OPERATORS;
  subnodes: ConfigQuery[];
};

export type ComparationQuery = {
  operation: COMPARASION_OPERATORS;
  key?: {
    path: string;
    type: KEY_TYPES;
  };
  keyPreset?: string;
  value: string | number;
};

export type ConfigQuery = LogicalQuery | ComparationQuery;
