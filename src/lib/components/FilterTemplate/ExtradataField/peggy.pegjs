{{
  function processValue(key, operation, content) {
    if(content.type) {
      return content;
    }

    const value = content.value;
    if(!value) {
      return {err: `ENTER_VALUE|${key}`}
    }

    if (value.toLowerCase() === "true") {
      return {value: "TRUE", type: "BOOLEAN"};
    }

    if (value.toLowerCase() === "false") {
      return {value: "FALSE", type: "BOOLEAN"};
    }

    if(value.startsWith('DATE:')) {
      const dateParts = value.split(':')[1].split('/');
      if(isNaN(new Date([...dateParts].reverse()))) {
        return {err: 'Wrong date format DATE:DD/MM/YYYY'};
      }
      return {value: dateParts.join('/'), type: 'DATE'};
    }

    const isNumber = /^\+?[\d\.]+$/.test(value);
    if(isNumber) {
      const numberValue = +value;
      if(!isNaN(numberValue)) return {value: +value, type: 'NUMBER'};
    }
    return {value, type: 'TEXT'};
  }
}}


QUERY
  = EXPRESSION

EXPRESSION
  = head:FACTOR tail:(_ (LOGICAL_OPERATOR) _ FACTOR)* {

    function formatNode(node) {
      const not = node?.not;
      delete node['not'];

      if(not) {
        return {
          operation: "NOT",
          subnodes: [
            node,
          ]
        }
      }

      return node;
    }

    if(tail.length) {
      const operations = new Set(tail.map(t => t[1]));
      if (operations.size > 1) {
        error("Do not mix operators [AND, OR] use (parenthesis) to mix them");
      }
      
      const operation = tail[0][1];
      const subnodes = [formatNode(head), ...tail.map(t => {
        return formatNode(t[3]);
      })]

      return {
        operation,
        subnodes
      }
    }

    return formatNode(head);
  }

FACTOR
  = "(" _ expr:EXPRESSION _ ")" { return expr; }
  / query:SIMPLE_QUERY { return query; }

SIMPLE_QUERY
  = _ not:"NOT"i? _ keyPreset:KEY_TEMPLATE _ operation:OPERATOR _ val:VALUE {
    const { value, type, err } = processValue(keyPreset, operation, val);
    if(err) error(err);
    return {not: !!not, key: {path: keyPreset, type}, operation, keyPreset , value};
  }
  / _ not:"NOT"i? _ keyPreset:KEY_TEMPLATE _ operation:VALUE_LESS_OPERATOR {
    return {not: !!not, key: {path: keyPreset, type: 'TEXT'}, operation, keyPreset , value: ''};
  }
  / _ not:"NOT"i? _ key:KEY _ operation:OPERATOR _ val:VALUE {
    const { value, type, err } = processValue(key, operation, val);
    if(err) error(err);
  	return {not: !!not, key: {path: key, type}, operation, value};
  }
  / _ not:"NOT"i? _ key:KEY _ operation:VALUE_LESS_OPERATOR {
    return {not: !!not, key: {path: key, type: 'TEXT'}, operation, value: ''};
  }

// DYNAMIC_KEYS by src/lib/components/FilterTemplate/ExtradataField/getParser.ts
KEY_TEMPLATE = "KEY_TEMPLATE"

VALUE
  = '"' content:([^"]*) '"' { return {value: content.join(""), type: 'TEXT'}; }
  / content:([^\)\) ]*) { return {value: content.join("").trim()}; }

KEY "KEY"
  = _ str:[a-z0-9_\.-]i+ S { return str.join(""); }
  / _ "\"" str:([^"]*) "\"" S { return str.join(""); }

LOGICAL_OPERATOR
  = "AND"i { return 'AND'; }
  / "OR"i { return 'OR'; }

OPERATOR
  = "EQUALS"i { return 'EQUALS'; }
  / "="i { return 'EQUALS'; }
  / "NOT_EQUALS"i { return 'NOT_EQUALS'; }
  / "!="i { return 'NOT_EQUALS'; }
  / "CONTAINS"i { return 'CONTAINS'; }
  / "STARTS_WITH"i { return 'STARTS_WITH'; }
  / "ENDS_WITH"i { return 'ENDS_WITH'; }
  / "GREATER_THAN_EQUAL"i { return 'GREATER_THAN_EQUAL'; }
  / "GREATER_THAN"i { return 'GREATER_THAN'; }
  / "LOWER_THAN_EQUAL"i { return 'LOWER_THAN_EQUAL'; }
  / "LOWER_THAN"i { return 'LOWER_THAN'; }

VALUE_LESS_OPERATOR
  = "IS_NULL"i
  / "IS_NOT_NULL"i
  / "EXISTS"i

_ "whitespace"
  = [ \t\n\r]*

S "required whitespace"
  = [ \t\n\r]+
