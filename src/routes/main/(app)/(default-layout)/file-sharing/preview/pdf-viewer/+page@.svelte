<script>
  import '$lib/../app.css';
  import 'pdfjs-dist/web/pdf_viewer.css';
  import { getDocument, GlobalWorkerOptions, PasswordResponses } from 'pdfjs-dist';
  import { PDFViewer, EventBus, PDFLinkService, GenericL10n, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer.mjs';
  import { onMount } from 'svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import WarningIcon from '$lib/components/materialIcons/WarningIcon.svelte';
  import setupPrintProcessing from '$lib/modules/pdf/printProcessing';
  import PrintServiceDialog from './PrintServiceDialog.svelte';
  import { PDFRenderingQueue } from '$lib/modules/pdf/PDFRenderingQueue';

  const DEFAULT_PRINT_RESOLUTION = 150;
  const DEFAULT_SCALE_VALUE = 'auto';
  const MAX_IMAGE_SIZE = 30 * 1024 * 1024;

  const WORKER_SRC = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);
  const SANDBOX_BUNDLE_SRC = new URL('pdfjs-dist/build/pdf.sandbox.mjs', import.meta.url);

  let showPrintServiceDialog = false;
  let printProgress = false;
  let printProcessingInitialized = false;

  let fileAsURL;
  let container;
  let printContainer;
  let eventBus;
  let l10n;
  let pdfScriptingManager;
  let pdfRenderingQueue;
  let pdfViewer;
  let linkService;
  let pdfDocument;
  let password;
  let setPasswordCallback;
  let passwordReason;
  let error;

  $: fileAsURL && previewFile();

  async function previewFile() {
    try {
      // setup worker
      GlobalWorkerOptions.workerSrc = WORKER_SRC.href;

      // prepare preview
      eventBus = new EventBus();
      linkService = new PDFLinkService({ eventBus });
      l10n = new GenericL10n();
      pdfScriptingManager = new PDFScriptingManager({
        eventBus,
        sandboxBundleSrc: SANDBOX_BUNDLE_SRC
      });
      pdfRenderingQueue = new PDFRenderingQueue();
      pdfViewer = new PDFViewer({
        container,
        eventBus,
        linkService,
        l10n,
        scriptingManager: pdfScriptingManager,
        renderingQueue: pdfRenderingQueue,
        maxCanvasPixels: 0,
        textLayerMode: 0,
        enablePrintAutoRotate: true
      });
      linkService.setViewer(pdfViewer);
      pdfScriptingManager.setViewer(pdfViewer);
      pdfRenderingQueue.setViewer(pdfViewer);

      eventBus.on('pagesinit', function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
      });

      // load document
      const loadingTask = await getDocument({
        url: fileAsURL,
        maxImageSize: MAX_IMAGE_SIZE,
        cMapUrl: '/pdfjs-dist/cmaps/',
        cMapPacked: true
      });

      loadingTask.onPassword = function (setPassword, reason) {
        setPasswordCallback = setPassword;
        passwordReason = reason;
      };

      loadingTask.onProgress = function (progressData) {
        console.log('loading progress:', progressData.loaded / progressData.total);
      };

      pdfDocument = await loadingTask.promise;

      // preview document
      pdfViewer.setDocument(pdfDocument);
      linkService.setDocument(pdfDocument);

      eventBus.on('pagerendered', function () {
        if (!printProcessingInitialized) {
          // setup printing
          setupPrintProcessing({
            eventBus,
            printContainer,
            printResolution: DEFAULT_PRINT_RESOLUTION,
            pdfDocument,
            pdfViewer,
            pdfRenderingQueue,
            l10n,
            pdfScriptingManager
          });

          printProcessingInitialized = true;
        }
      });
    } catch (err) {
      error = err;
    }
  }

  function submitPassword() {
    const _password = password;
    const _setPasswordCallback = setPasswordCallback;
    password = undefined;
    setPasswordCallback = undefined;
    passwordReason = undefined;
    _setPasswordCallback(_password);
  }

  function propagateBeforePrint() {
    if (eventBus) eventBus.dispatch('beforeprint', { source: window });
  }

  function propagateAfterPrint() {
    if (eventBus) eventBus.dispatch('afterprint', { source: window });
  }

  function handleMessage(event) {
    if (event.source === window.parent && event.data.type === 'to-preview') {
      fileAsURL = event.data.value;
    }
  }

  onMount(async () => {
    window.parent.postMessage({ type: 'loaded' });
  });
</script>

<svelte:window
  on:message={handleMessage}
  on:resize={() => {
    pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
  }}
  on:beforeprint={propagateBeforePrint}
  on:afterprint={propagateAfterPrint}
/>

<PrintServiceDialog modalOpened={showPrintServiceDialog} progress={printProgress} />

<div id="outerContainer">
  {#if error}
    <FlexContainer column height="100vh" align_items="center" justify_content="center" bgColor="var(--new-layer-color)" padding="0.5rem">
      <GridContainer width="auto" align_items="center" template_columns="30px 1fr" gap="0.5rem">
        <WarningIcon color="var(--danger-color)" dimension="30px" />
        <h3 class="no-margin">Oops! File preview failed...</h3>
      </GridContainer>
    </FlexContainer>
  {:else}
    <div id="viewerContainer" bind:this={container} class:hidden={!!passwordReason}>
      <div id="viewer" class="pdfViewer"></div>
    </div>
    {#if passwordReason}
      <Form on:submit={submitPassword}>
        <FlexContainer column height="100vh" width="auto" align_items="center" justify_content="center" padding="0.5rem">
          <FlexContainer column width="auto" align_items="center" justify_content="center" padding="1rem" gap="1rem" rounded>
            <h4 class="no-margin">{passwordReason === PasswordResponses.NEED_PASSWORD ? 'PDF Requires Password' : 'Incorrect Password'}</h4>
            <FlexContainer column width="auto" gap="0.5rem">
              <Input type="password" name="password" placeholder="Enter Password" bind:value={password} />
              <Button width="100%" type="submit" primary rounded strong>Submit</Button>
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </Form>
    {/if}
  {/if}
</div>

<div bind:this={printContainer} id="printContainer"></div>

<style>
  #outerContainer {
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: var(--new-layer-color);
  }

  #viewerContainer {
    position: absolute;
    width: 100%;
    overflow: auto;
    visibility: visible;
  }

  #viewerContainer.hidden {
    visibility: hidden;
  }

  #printContainer {
    display: none;
  }

  @page {
    margin: 0;
  }

  @media print {
    :global(body) {
      background: rgb(0 0 0 / 0) none;
    }

    :global(body[data-pdfjsprinting] #outerContainer) {
      display: none;
    }

    :global(body[data-pdfjsprinting] #printContainer) {
      display: block;
    }

    :global(#printContainer) {
      height: 100%;
    }

    /* wrapper around (scaled) print canvas elements */
    :global(#printContainer > .printedPage) {
      page-break-after: always;
      page-break-inside: avoid;

      /* The wrapper always cover the whole page. */
      height: 100%;
      width: 100%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    :global(#printContainer > .xfaPrintedPage .xfaPage) {
      position: absolute;
    }

    :global(#printContainer > .xfaPrintedPage) {
      page-break-after: always;
      page-break-inside: avoid;
      width: 100%;
      height: 100%;
      position: relative;
    }

    :global(#printContainer > .printedPage :is(canvas, img)) {
      /* The intrinsic canvas / image size will make sure that we fit the page. */
      max-width: 100%;
      max-height: 100%;

      direction: ltr;
      display: block;
    }
  }
</style>
