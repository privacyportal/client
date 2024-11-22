<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import RefreshIcon from '$lib/components/materialIcons/RefreshIcon.svelte';
  import { startLibp2pNode, stopNode } from '$lib/modules/p2p/libp2pUtil';
  import { handleFileTransferProtocol } from '$lib/modules/p2p/fileTransferProtocol';
  import { onDestroy, onMount } from 'svelte';
  import { multiaddr } from '@multiformats/multiaddr';
  import hashFile from '$lib/modules/hashFile';
  import { CustomError, displayError } from '$lib/modules/errors';
  import { goto } from '$app/navigation';
  import { releaseScreenWakeLock, requestScreenWakeLock } from '$lib/modules/screenWakeLock';

  export let peerId;
  export let turnCredentials;
  export let remoteAddress;
  export let file;
  export let fileHash;
  export let fileSize;
  let receivingStep = 0;
  let node;
  let file_promise;
  let error;
  let wakeLock;

  const FILE_CORRUPTED_ERR = 'File corrupted during transfer. Please try again.';

  const RECEIVING_STEPS = [
    { labels: ['Connecting to server...', 'Connected to server.', 'Connection failed'], action: connectToRelay },
    { labels: ['Receiving file from sender...', 'File transfer complete.', 'File transfer failed'], action: receiveFile }
  ];

  async function connectToRelay() {
    console.log('connectToRelay');
    return new Promise(async (resolveConnected, rejectConnected) => {
      try {
        if (!node) {
          const session = {
            turn: turnCredentials
          };
          node = await startLibp2pNode({
            peerId,
            session,
            isSender: false
          });
        }

        file_promise = handleFileTransferProtocol({
          node,
          peerAddress: multiaddr(remoteAddress),
          expectedSize: fileSize,
          resolveConnected
        });

        node.addEventListener('self:peer:update', () => {
          console.log('event: self:peer:update');
          console.log(`Advertising with a relay address of ${node.getMultiaddrs().map((addr) => addr.toString())}`);
        });
      } catch (err) {
        rejectConnected(err);
      }
    });
  }

  async function receiveFile() {
    try {
      const receivedFile = await file_promise;

      // verify file size
      if (fileSize !== receivedFile.size) throw new Error(FILE_CORRUPTED_ERR);

      // verify file hash and size
      const hash = await hashFile(receivedFile);
      if (fileHash !== hash) throw new Error(FILE_CORRUPTED_ERR);

      file = receivedFile;
    } catch (err) {
      error = err;
      console.error(err);
      throw new CustomError({ message: 'Failed to receive file. Please try again.' })
    }
  }

  async function handleClose({ redirect } = { redirect: true }) {
    receivingStep = 0;
    file = undefined;
    error = undefined;
    if (redirect) {
      goto('/');
    }
  }

  async function handleCancellation() {
    await stopNode().catch(console.error);
    handleClose();
  }

  async function handleRetry() {
    handleClose({ redirect: false });
    await connectAndFetch();
  }

  async function connectAndFetch() {
    try {
      wakeLock = await requestScreenWakeLock();
      for (receivingStep = 0; receivingStep < RECEIVING_STEPS.length; receivingStep++) {
        await RECEIVING_STEPS[receivingStep].action();
      }
    } catch (err) {
      displayError(err);
    } finally {
      wakeLock = await releaseScreenWakeLock(wakeLock);
    }
  }

  onMount(async () => {
    await connectAndFetch();
  });

  onDestroy(async () => {
    await releaseScreenWakeLock(wakeLock);
    if (node) await stopNode(node).catch(console.error);
  });
</script>

<FlexContainer column align_items="center" justify_content="center" gap="0.5rem">
  <GridContainer width="auto" align_items="center" justify_items="start" template_columns="1fr auto" padding="0.5rem" gap="0.3rem" rounded border>
    {#each RECEIVING_STEPS as step, index}
      {#if index < receivingStep}
        <div class="justify-self-end"><CheckCircleIcon dimension="15px" /></div>
        <span class="sm">{step.labels[1]}</span>
      {:else if index === receivingStep}
        <div class="justify-self-end">
          {#if error}
            <CloseIcon dimension="15px" color="var(--danger-color)" />
          {:else}
            <RefreshIcon animated dimension="15px" />
          {/if}
        </div>
        <span class="sm">{step.labels[error ? 2 : 0]}</span>
      {/if}
    {/each}
  </GridContainer>
  {#if error}
    <Button on:click={handleRetry} width="100%" basic rounded>Retry</Button>
  {/if}
  {#if receivingStep === RECEIVING_STEPS.length}
    <Button on:click={handleClose} width="100%" basic rounded>Close</Button>
  {:else}
    <Button on:click={handleCancellation} width="100%" basic rounded>Cancel</Button>
  {/if}
</FlexContainer>
