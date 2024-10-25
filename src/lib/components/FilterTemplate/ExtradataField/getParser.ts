import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
import * as peggy from 'peggy';
import peggyLanguage from './peggy.pegjs?raw';

export default function getParser(keyTemplates: ExtradataKeyTemplate[]) {
  if (keyTemplates.length) {
    const fields = keyTemplates.map(
      (kt) => `"${kt.keyPreset.key.path}" { return '${kt.keyPreset.key.path}' }`
    );
    const peggyLanguageWithKeyTemplates = peggyLanguage.replace(
      'KEY_TEMPLATE = "KEY_TEMPLATE"',
      `KEY_TEMPLATE\n  = ${fields.join('\n  / ')}
      `
    );
    const parser = peggy.generate(peggyLanguageWithKeyTemplates);
    return parser;
  }
  const parser = peggy.generate(peggyLanguage);
  return parser;
}
