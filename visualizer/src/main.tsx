import { Theme } from '@radix-ui/themes';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Snappy from 'snappyjs';
import { Toaster } from 'sonner';
import { RunManager } from './modules/run-manager';
import { OverlayElementRoot } from './modules/visualization/components/overlay';
import { Router } from './router';

import '@radix-ui/themes/styles.css';
import { base64ToArrayBuffer } from './modules/lib/base64ToArrayBuffer';
import './reset.css';

let url = new URL(window.location.href);

if (url.searchParams.get('iframe-ingest')) {
  window.addEventListener('message', async event => {
    if (event.data.type === 'ingest') {
      let stringContent = event.data.trace;
      let blob = new Blob([stringContent], { type: 'application/octet-stream' });
      let { id } = await RunManager.store(blob);

      // Respond to the parent window with the run ID
      window.parent.postMessage({ type: 'ingest-response', id }, '*');
      console.log(`Ingested run with ID: ${id}`);

      window.location.href = (url.pathname + `/${id}`).replace(/\/\//g, '/');
    }
  });
} else if (url.searchParams.has('trace')) {
  let traceBase64 = url.searchParams.get('trace')!;
  let trace = Snappy.uncompress(base64ToArrayBuffer(traceBase64));
  let string = new TextDecoder().decode(trace);
  let blob = new Blob([string], { type: 'application/octet-stream' });

  RunManager.create(blob).then(({ id }) => {
    window.location.href = (url.pathname + `/${id}`).replace(/\/\//g, '/');
  });
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Theme
        accentColor="blue"
        grayColor="gray"
        panelBackground="translucent"
        scaling="95%"
        radius="full"
        style={{ width: 'fit-content', minWidth: '100vw' }}
      >
        <Router />

        <Toaster closeButton={false} richColors={true} position="bottom-right" />

        <OverlayElementRoot />
      </Theme>
    </React.StrictMode>
  );
}
