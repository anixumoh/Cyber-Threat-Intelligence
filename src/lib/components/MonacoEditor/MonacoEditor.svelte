<script lang="ts">
  import type monaco from 'monaco-editor';
  import { onDestroy, tick } from 'svelte';
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

  export let language: string;
  export let value: string;

  let divEl: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: typeof import('monaco-editor');
  let mounted = false;
  let selfChange = false;
  let clientWidth = 0;
  let clientHeight = 0;

  onDestroy(() => editor?.dispose());

  $: divEl && setUp();
  $: mounted && setValueAndLanguage(value, language);

  async function setUp() {
    editor?.dispose();
    self.MonacoEnvironment = {
      async getWorker(_, label) {
        if (label === 'json') {
          return new (await import('monaco-editor/esm/vs/language/json/json.worker?worker')).default();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new (await import('monaco-editor/esm/vs/language/css/css.worker?worker')).default();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new (await import('monaco-editor/esm/vs/language/html/html.worker?worker')).default();
        }
        if (label === 'typescript' || label === 'javascript') {
          return new (await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')).default();
        }
        return new editorWorker();
      }
    };

    Monaco = await import('monaco-editor');
    editor = Monaco.editor.create(divEl, {
      theme: 'vs-dark'
    });
    mounted = true;

    editor.onDidChangeModelContent(async () => {
      selfChange = true;
      value = editor.getValue();
      await tick();
      selfChange = false;
    });
  }

  function setValueAndLanguage(value: string, language: string) {
    if (selfChange) return;
    const model = Monaco.editor.createModel(value, language);
    editor.setModel(model);
  }

  function handleResize() {
    editor.layout({ width: clientWidth, height: clientHeight });
  }
</script>

<svelte:window on:resize={handleResize} />
<div bind:clientWidth bind:clientHeight bind:this={divEl} class="h-80" />
