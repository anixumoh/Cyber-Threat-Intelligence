import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
import { expect, it } from 'vitest';
import { KEY_TYPES } from './constants';
import getParser from './getParser';

const keyTemplates: ExtradataKeyTemplate[] = [
  {
    keyPreset: {
      key: {
        path: 'name',
        type: KEY_TYPES.TEXT
      },
      name: 'NAME'
    },
    description: 'Name of the CVE',
    enabled: true
  },
  {
    keyPreset: {
      key: {
        path: 'bl_score',
        type: KEY_TYPES.NUMBER
      },
      name: 'BL_SCORE'
    },
    description: 'Scoring of the CVE',
    enabled: true
  },
  {
    keyPreset: {
      key: {
        path: 'number_of_platforms',
        type: KEY_TYPES.NUMBER
      },
      name: 'NUMBER_OF_PLATFORMS'
    },
    description: 'Number of platforms this CVE is affecting',
    enabled: true
  }
];
const parser = getParser(keyTemplates);

it('Returns the right object on basic a query', () => {
  const query = 'Platform CONTAINS "Android"';
  expect(parser.parse(query)).toMatchObject({
    key: {
      path: 'Platform',
      type: 'TEXT'
    },
    operation: 'CONTAINS',
    value: 'Android'
  });
});

it('Returns the right object on composed queries', () => {
  const query = 'Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'Platform',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'Android'
      },
      {
        key: {
          path: 'dateTime',
          type: 'DATE'
        },
        operation: 'GREATER_THAN',
        value: '03/06/2023'
      }
    ]
  });
});

it('Returns the right object of a IS_NULL that is a value-less operator', () => {
  const query = 'SomeKey IS_NULL';
  expect(parser.parse(query)).toMatchObject({
    key: {
      path: 'SomeKey',
      type: 'TEXT'
    },
    operation: 'IS_NULL',
    value: ''
  });
});

it('Returns the right object when numbers', () => {
  const query = 'Version GREATER_THAN_EQUAL 10 AND Version LOWER_THAN_EQUAL 13.5';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'GREATER_THAN_EQUAL',
        value: 10
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'LOWER_THAN_EQUAL',
        value: 13.5
      }
    ]
  });
});

it('Returns the right object on composed queries with 3 items on the same level', () => {
  const query = 'Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023 AND Version LOWER_THAN_EQUAL 13';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'Platform',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'Android'
      },
      {
        key: {
          path: 'dateTime',
          type: 'DATE'
        },
        operation: 'GREATER_THAN',
        value: '03/06/2023'
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'LOWER_THAN_EQUAL',
        value: 13
      }
    ]
  });
});

it('Returns the right object on composed queries with 4 items on the same level', () => {
  const query =
    'Platform CONTAINS Android AND dateTime GREATER_THAN DATE:03/06/2023 AND Version LOWER_THAN_EQUAL 13 AND Version GREATER_THAN 10';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'Platform',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'Android'
      },
      {
        key: {
          path: 'dateTime',
          type: 'DATE'
        },
        operation: 'GREATER_THAN',
        value: '03/06/2023'
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'LOWER_THAN_EQUAL',
        value: 13
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'GREATER_THAN',
        value: 10
      }
    ]
  });
});

it('Returns the right object on different subqueries', () => {
  const query =
    'Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023 AND (Version EQUALS 11 OR Version EQUALS 12)';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'Platform',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'Android'
      },
      {
        key: {
          path: 'dateTime',
          type: 'DATE'
        },
        operation: 'GREATER_THAN',
        value: '03/06/2023'
      },
      {
        operation: 'OR',
        subnodes: [
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 11
          },
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 12
          }
        ]
      }
    ]
  });
});

it('Returns the right object on different subqueries with different operators', () => {
  const query =
    '(Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023) OR (Version EQUALS 11 OR Version EQUALS 12)';
  expect(parser.parse(query)).toMatchObject({
    operation: 'OR',
    subnodes: [
      {
        operation: 'AND',
        subnodes: [
          {
            key: {
              path: 'Platform',
              type: 'TEXT'
            },
            operation: 'CONTAINS',
            value: 'Android'
          },
          {
            key: {
              path: 'dateTime',
              type: 'DATE'
            },
            operation: 'GREATER_THAN',
            value: '03/06/2023'
          }
        ]
      },
      {
        operation: 'OR',
        subnodes: [
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 11
          },
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 12
          }
        ]
      }
    ]
  });
});

it('Returns the right object on different subqueries with different operators star starting with parenthesis', () => {
  const query =
    '(Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023) OR (Version EQUALS 11 OR Version EQUALS 12)';
  expect(parser.parse(query)).toMatchObject({
    operation: 'OR',
    subnodes: [
      {
        operation: 'AND',
        subnodes: [
          {
            key: {
              path: 'Platform',
              type: 'TEXT'
            },
            operation: 'CONTAINS',
            value: 'Android'
          },
          {
            key: {
              path: 'dateTime',
              type: 'DATE'
            },
            operation: 'GREATER_THAN',
            value: '03/06/2023'
          }
        ]
      },
      {
        operation: 'OR',
        subnodes: [
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 11
          },
          {
            key: {
              path: 'Version',
              type: 'NUMBER'
            },
            operation: 'EQUALS',
            value: 12
          }
        ]
      }
    ]
  });
});

it('Returns the right object on different subqueries with same operators star starting with parenthesis', () => {
  const query =
    '(Platform CONTAINS "Android" AND dateTime GREATER_THAN DATE:03/06/2023) OR Version EQUALS 11 OR Version EQUALS 12';
  expect(parser.parse(query)).toMatchObject({
    operation: 'OR',
    subnodes: [
      {
        operation: 'AND',
        subnodes: [
          {
            key: {
              path: 'Platform',
              type: 'TEXT'
            },
            operation: 'CONTAINS',
            value: 'Android'
          },
          {
            key: {
              path: 'dateTime',
              type: 'DATE'
            },
            operation: 'GREATER_THAN',
            value: '03/06/2023'
          }
        ]
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'EQUALS',
        value: 11
      },
      {
        key: {
          path: 'Version',
          type: 'NUMBER'
        },
        operation: 'EQUALS',
        value: 12
      }
    ]
  });
});

it('Returns the right object on not operator', () => {
  const query = 'NOT key CONTAINS asd';
  expect(parser.parse(query)).toMatchObject({
    operation: 'NOT',
    subnodes: [
      {
        key: {
          path: 'key',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'asd'
      }
    ]
  });
});

it('Allow keys with symbols ( _.- )', () => {
  const query = 'some_key.with-symbols CONTAINS asd';
  expect(parser.parse(query)).toMatchObject({
    key: {
      path: 'some_key.with-symbols',
      type: 'TEXT'
    },
    operation: 'CONTAINS',
    value: 'asd'
  });
});

it('Parse with key templates matches keyPreset bl_score', () => {
  const query = 'bl_score GREATER_THAN 3';
  expect(parser.parse(query)).toMatchObject({
    key: {
      path: 'bl_score',
      type: 'NUMBER'
    },
    keyPreset: 'bl_score',
    operation: 'GREATER_THAN',
    value: 3
  });
});

it('Mixing keypressets with keys', () => {
  const query = 'bl_score GREATER_THAN 3 AND number_of_platforms LOWER_THAN_EQUAL 5 AND someKey CONTAINS someValue';
  expect(parser.parse(query)).toMatchObject({
    operation: 'AND',
    subnodes: [
      {
        key: {
          path: 'bl_score',
          type: 'NUMBER'
        },
        keyPreset: 'bl_score',
        operation: 'GREATER_THAN',
        value: 3
      },
      {
        key: {
          path: 'number_of_platforms',
          type: 'NUMBER'
        },
        keyPreset: 'number_of_platforms',
        operation: 'LOWER_THAN_EQUAL',
        value: 5
      },
      {
        key: {
          path: 'someKey',
          type: 'TEXT'
        },
        operation: 'CONTAINS',
        value: 'someValue'
      }
    ]
  });
});
