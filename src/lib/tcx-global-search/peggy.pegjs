QUERY
  = EXPRESSION

EXPRESSION
  = head:FACTOR tail:(_ (LOGICAL_OPERATOR) _ FACTOR)* {

    function formatNode(node) {
      if(node?.key !== undefined && typeof node?.key !== 'object') {
        const type = node?.value?.type || "TEXT"
        node.value = node?.value?.value ?? ""
        node.key = {
          path: node.key,
          type
        }
      }
      return node;
    }

    if(tail.length) {
      const operations = new Set(tail.map(t => t[1]));
      if (operations.size > 1) {
        error("MIXING_OPERATORS");
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

    return formatNode(head)
  }

FACTOR
  = "(" _ expr:EXPRESSION _ ")" { return expr; }
  / query:SIMPLE_QUERY { return query; }

SIMPLE_QUERY
    = _ not:"NOT"i? _ field:BOOLEAN_FIELD _ operation:BOOLEAN_OPERATOR _ value:BOOLEAN { return {not: !!not, field, operation, value, type: 'BOOLEAN'} }
    / _ not:"NOT"i? _ field:DATE_FIELD _ operation:DATE_OPERATOR _ value:DATE { return {not: !!not, field, operation, value, type: 'DATE'} }
    / _ not:"NOT"i? _ field:CHOICE_FIELD _ operation:CHOICE_OPERATOR _ value:CHOICE { return {not: !!not, field, operation, value, type: 'CHOICE'} }
    / _ not:"NOT"i? _ field:LIST_FIELD _ operation:LIST_OPERATOR _ value:LIST { return {not: !!not, field, operation, value, type: 'LIST'} }
    / _ not:"NOT"i? _ field:RELATIONSHIP_FIELD _ operation:RELATIONSHIP_OPERATOR _ value:RELATIONSHIP { return {not: !!not, field, operation, value, type: 'RELATIONSHIP'} }
    / _ not:"NOT"i? _ field:STRING_FIELD _ operation:STRING_OPERATOR _ value:STRING { return {not: !!not, field, operation, value, type: 'STRING'} }

// PEGGY_FIELD_TYPES START
STRING_FIELD
  = "actor.name"
  / "actor.description"
  / "actor.targets_category"
  / "actor.country_code"
  / "actor.cve"
  / "campaign.name"
  / "campaign.description"
  / "campaign.cve"
  / "tool.name"
  / "tool.version"
  / "tool.cve"

BOOLEAN_FIELD
  = "actor.active"

CHOICE_FIELD
  = "actor.tlp"
  / "actor.sophistication"
  / "campaign.tlp"
  / "tool.tlp"

DATE_FIELD
  = "actor.first_seen"
  / "actor.last_seen"
  / "campaign.first_seen"
  / "campaign.last_seen"
  / "tool.first_seen"
  / "tool.last_seen"

LIST_FIELD
  = "actor.types"
  / "actor.aliases"
  / "tool.targeted_platforms"

RELATIONSHIP_FIELD
  = "actor.targets"
  / "actor.campaigns"
  / "actor.country"
  / "actor.attack_patterns"

// PEGGY_FIELD_TYPES END

// PEGGY_OPERATOR_TYPES START
STRING_OPERATOR
  = "="
  / "^"
  / "$"
  / "~"

LIST_OPERATOR
  = "="

RELATIONSHIP_OPERATOR
  = "="
  / "^"
  / "$"
  / "~"

CHOICE_OPERATOR
  = "="
  / "^"
  / "$"
  / "~"

BOOLEAN_OPERATOR
  = "="

DATE_OPERATOR
  = "="
  / ">"
  / ">="
  / "<"
  / "<="

// PEGGY_OPERATOR_TYPES END

INTEGER "NUMBER"
  = _ [0-9]+ { return parseFloat(text(), 10); }

STRING "STRING"
  = _ str:[a-z0-9]i+ { return str.join(""); }
  / _ "\"" str:([^"]*) "\"" { return str.join(""); }

BOOLEAN
  = "TRUE"i { return 1 }
  / "FALSE"i { return 0 }
 
DATE "DATE"
  = day:INTEGER "/" month:INTEGER "/" year:INTEGER {
      if(isNaN(new Date(year, month, day))) {
        error('Wrong date format DD/MM/YYYY');
      }
      return [day, month, year].join('/')
  }

CHOICE
  = str:STRING

LIST
  = str:STRING

RELATIONSHIP
  = str:STRING

LOGICAL_OPERATOR
  = "AND"i { return 'AND'; }
  / "OR"i { return 'OR'; }

_ "whitespace"
  = [ \t\n\r]*
