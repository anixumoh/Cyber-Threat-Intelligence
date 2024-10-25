import * as peggy from './peggy';

function globalSearchParser(query: string) {
  const output = peggy.parse(query, {});
  return output;
}

export default globalSearchParser;
