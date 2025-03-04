/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PDFPrintServiceFactory } from './PDFPrintService';

let printProcessing;

class PrintProcessing {
  constructor({ eventBus, printContainer, printResolution, pdfDocument, pdfViewer, pdfRenderingQueue, l10n, pdfScriptingManager }) {
    this.eventBus = eventBus;
    this.printContainer = printContainer;
    this.printResolution = printResolution;
    this.pdfDocument = pdfDocument;
    this.pdfViewer = pdfViewer;
    this.pdfRenderingQueue = pdfRenderingQueue;
    this.l10n = l10n;
    this.pdfScriptingManager = pdfScriptingManager;
  }

  beforePrint() {
    this.printAnnotationStoragePromise = this.pdfScriptingManager
      .dispatchWillPrint()
      .catch(() => {
        /* Avoid breaking printing; ignoring errors. */
      })
      .then(() => this.pdfDocument?.annotationStorage.print);

    if (this.printService) {
      // There is no way to suppress beforePrint/afterPrint events,
      // but PDFPrintService may generate double events -- this will ignore
      // the second event that will be coming from native window.print().
      return;
    }

    if (!PDFPrintServiceFactory.supportsPrinting) {
      this._otherError('pdfjs-printing-not-supported');
      return;
    }

    // The beforePrint is a sync method and we need to know layout before
    // returning from this method. Ensure that we can get sizes of the pages.
    if (!this.pdfViewer.pageViewsReady) {
      this.l10n.get('pdfjs-printing-not-ready').then((msg) => {
        // eslint-disable-next-line no-alert
        window.alert(msg);
      });
      return;
    }

    this.printService = PDFPrintServiceFactory.createPrintService({
      pdfDocument: this.pdfDocument,
      pagesOverview: this.pdfViewer.getPagesOverview(),
      printContainer: this.printContainer,
      printResolution: this.printResolution,
      printAnnotationStoragePromise: this.printAnnotationStoragePromise
    });

    this.forceRendering();
    this.printService.layout();
  }

  forceRendering() {
    this.pdfRenderingQueue.printing = !!this.printService;
    this.pdfRenderingQueue.isThumbnailViewEnabled = false;
    this.pdfRenderingQueue.renderHighestPriority();
  }

  afterPrint() {
    if (this.printAnnotationStoragePromise) {
      this.printAnnotationStoragePromise.then(() => {
        this.pdfScriptingManager.dispatchDidPrint();
      });
      this.printAnnotationStoragePromise = null;
    }

    if (this.printService) {
      this.printService.destroy();
      this.printService = null;

      this.pdfDocument?.annotationStorage.resetModified();
    }
    this.forceRendering();
  }
}

export default function setupPrintProcessing({ eventBus, printContainer, printResolution, pdfDocument, pdfViewer, pdfRenderingQueue, l10n, pdfScriptingManager }) {
  if (printProcessing) throw new Error('Print processing already set up.');
  printProcessing = new PrintProcessing({
    eventBus,
    printContainer,
    printResolution,
    pdfDocument,
    pdfViewer,
    pdfRenderingQueue,
    l10n,
    pdfScriptingManager
  });

  const ac = new AbortController();
  eventBus._on('beforeprint', () => printProcessing.beforePrint(), { signal: ac.signal });
  eventBus._on('afterprint', () => printProcessing.afterPrint(), { signal: ac.signal });
}
