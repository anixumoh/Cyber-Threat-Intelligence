<script lang="ts">
  import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
  import 'pdfjs-dist/web/pdf_viewer.css';
  import { onMount, tick } from 'svelte';

  export let pdf: Blob;
  export let cutPages = Infinity;

  const ZOOM_LISTENER_OPS: AddEventListenerOptions & EventListenerOptions = { passive: false };
  const ZOOM_STEP = 5;
  const ZOOM_MAX = 250;
  const ZOOM_MIN = 25;
  const CSS_UNITS = 96 / 72;

  let pdfContainer: HTMLDivElement;
  let containers: HTMLDivElement[] = [];
  let numPages = 0;
  let zoom = 100;
  let pdfDocument: PDFDocumentProxy;
  let pdfjs: typeof import('pdfjs-dist');
  let viewer: typeof import('pdfjs-dist/web/pdf_viewer');
  let timeout: NodeJS.Timeout;
  let mounted = false;
  let ready = false;

  onMount(() => {
    mounted = true;
    return () => {
      mounted = false;
      document.removeEventListener('wheel', onWheel, ZOOM_LISTENER_OPS);
      window.removeEventListener('resize', debounceRender);
    };
  });

  $: init(pdf, ready);

  async function importPdfJs() {
    if (ready) return;
    const [imported_pdfjs, imported_viewer, pdfjsWorker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/legacy/web/pdf_viewer'),
      import('pdfjs-dist/build/pdf.worker.min.js?url')
    ]);
    pdfjs = imported_pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
    viewer = imported_viewer;
    ready = true;
  }

  async function init(pdf: Blob, ready: boolean) {
    if (!pdf) return;
    if (!ready) return importPdfJs();
    const pdfArrayBuffer = await pdf.arrayBuffer();
    pdfDocument = await pdfjs.getDocument({ data: pdfArrayBuffer }).promise;
    numPages = Math.min(pdfDocument.numPages, cutPages);

    await tick();

    if (!mounted) return;
    await renderPdfs();
    document.addEventListener('wheel', onWheel, ZOOM_LISTENER_OPS);
    window.addEventListener('resize', debounceRender);
  }

  function debounceRender() {
    clearTimeout(timeout);
    timeout = setTimeout(() => renderPdfs(), 100);
  }

  async function renderPdfs() {
    for (let i = 0; i < numPages; i++) {
      containers[i].innerHTML = '';
    }
    await tick();
    for (let i = 0; i < numPages; i++) {
      const pageNum = i + 1;
      const pdfPage = await pdfDocument.getPage(pageNum);
      const eventBus = new viewer.EventBus();
      const viewport = pdfPage.getViewport({ scale: 1 });
      const scale = pdfContainer.clientWidth / (viewport.width * CSS_UNITS);

      const pdfPageView = new viewer.PDFPageView({
        container: containers[i],
        id: i,
        defaultViewport: viewport,
        eventBus,
        scale: scale,
        // We can enable text/annotation/xfa/struct-layers, as needed.
        textLayerFactory: !pdfDocument.isPureXfa ? new viewer.DefaultTextLayerFactory() : null,
        annotationLayerFactory: new viewer.DefaultAnnotationLayerFactory(),
        xfaLayerFactory: pdfDocument.isPureXfa ? new viewer.DefaultXfaLayerFactory() : null,
        structTreeLayerFactory: new viewer.DefaultStructTreeLayerFactory()
      });
      pdfPageView.setPdfPage(pdfPage);
      pdfPageView.draw();
    }
  }

  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      const zoomIn = e.deltaY < 0;
      const zoomOut = e.deltaY > 0;
      if (zoomIn) {
        zoom = Math.min(zoom + ZOOM_STEP, ZOOM_MAX);
      } else if (zoomOut) {
        zoom = Math.max(zoom - ZOOM_STEP, ZOOM_MIN);
      }
      debounceRender();
    }
  }
</script>

<div class="flex flex-col gap-2 w-full mx-auto" style="width: {zoom}%" bind:this={pdfContainer}>
  {#each Array(numPages) as _, i}
    <div class="relative mx-auto w-full bg-white">
      <div class="w-full" bind:this={containers[i]} />
    </div>
  {/each}
</div>
