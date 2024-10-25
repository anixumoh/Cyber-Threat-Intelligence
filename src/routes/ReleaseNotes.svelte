<script lang="ts">
  import Client from '$lib/client';
  import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-svelte';
  import { onMount, tick } from 'svelte';
  import { Download } from 'carbon-icons-svelte';
  import 'pdfjs-dist/web/pdf_viewer.css';
  import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

  const client = new Client();
  const ZOOM_LISTENER_OPS: AddEventListenerOptions & EventListenerOptions = { passive: false };
  const ZOOM_STEP = 5;
  const ZOOM_MAX = 250;
  const ZOOM_MIN = 25;
  const CSS_UNITS = 96 / 72;

  let checked = false;
  let open = false;
  let pdf: Blob;
  let pdfContainer: HTMLDivElement;
  let containers: HTMLDivElement[] = [];
  let numPages = 0;
  let zoom = 100;
  let pdfDocument: PDFDocumentProxy;
  let pdfjs: typeof import('pdfjs-dist');
  let viewer: typeof import('pdfjs-dist/web/pdf_viewer');
  let timeout: NodeJS.Timeout;
  let mounted = false;

  onMount(() => {
    mounted = true;
    init();
    return () => {
      mounted = false;
      document.removeEventListener('wheel', onWheel, ZOOM_LISTENER_OPS);
      window.removeEventListener('resize', debounceRender);
    };
  });

  async function importPdfJs() {
    const [imported_pdfjs, imported_viewer, pdfjsWorker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/web/pdf_viewer'),
      import('pdfjs-dist/build/pdf.worker.min.js?url')
    ]);
    pdfjs = imported_pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
    viewer = imported_viewer;
  }

  async function init() {
    const response = await client.user.getReleaseNotes();
    if (response.status === 200) {
      pdf = new Blob([response.data], { type: 'application/pdf' });
      await importPdfJs();
      const pdfArrayBuffer = await pdf.arrayBuffer();
      pdfDocument = await pdfjs.getDocument({ data: pdfArrayBuffer }).promise;
      numPages = pdfDocument.numPages;

      await tick();

      if (!mounted) return;
      renderPdfs();
      open = true;
      document.addEventListener('wheel', onWheel, ZOOM_LISTENER_OPS);
      window.addEventListener('resize', debounceRender);
    }
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

  function onClose() {
    pdf = undefined;
    document.removeEventListener('wheel', onWheel, ZOOM_LISTENER_OPS);
    window.removeEventListener('resize', debounceRender);
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey) {
      const zoomIn = e.deltaY < 0;
      const zoomOut = e.deltaY > 0;
      if (zoomIn) {
        zoom = Math.min(zoom + ZOOM_STEP, ZOOM_MAX);
      } else if (zoomOut) {
        zoom = Math.max(zoom - ZOOM_STEP, ZOOM_MIN);
      }
      debounceRender();
    } else {
      const y = e.shiftKey ? e.deltaX : e.deltaY;
      const x = e.shiftKey ? e.deltaY : e.deltaX;
      pdfContainer.parentElement.scroll({
        top: pdfContainer.parentElement.scrollTop + y,
        left: pdfContainer.parentElement.scrollLeft + x
      });
    }
  }

  async function hideReleaseNotes() {
    open = false;
    await client.user.hideReleaseNotesNextTime();
  }

  function downloadPdf() {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(pdf);
    a.href = url;
    a.download = 'Release notes';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
</script>

<ComposedModal bind:open on:close={onClose} size="lg">
  <ModalHeader>
    <p>
      We have recently installed a new version with relevant changes and improvements.
      <br />
      Please download the PDF to review its details and reach out to
      <a rel="noreferrer" target="_blank" href="https://servicedesk.outpost24.com/servicedesk/customer/portals"
        >support</a
      >
      if you have any doubts. Thanks in advance!
    </p>
    <Button kind="ghost" on:click={downloadPdf} class="flex ml-auto" icon={Download} iconDescription="Download" />
  </ModalHeader>
  <ModalBody class="h-[800px] max-h-[calc(100vh-288px)]">
    <div class="flex flex-col gap-2 w-full mx-auto" style="width: {zoom}%" bind:this={pdfContainer}>
      {#each Array(numPages) as _, i}
        <div class="relative mx-auto w-full bg-white">
          <div class="w-full" bind:this={containers[i]} />
        </div>
      {/each}
    </div>
  </ModalBody>

  <ModalFooter class="flex items-center justify-between">
    <label class="pl-4">
      <input type="checkbox" bind:checked />
      Don't show me this information anymore.
    </label>
    <Button disabled={!checked} on:click={hideReleaseNotes}>Accept</Button>
  </ModalFooter>
</ComposedModal>
