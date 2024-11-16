<script>
  import '$lib/modules/iterableStreamPolyfill';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { multiaddr } from '@multiformats/multiaddr';
  import RefreshIcon from '$lib/components/materialIcons/RefreshIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import { createFileSharingInvite, createFileSharingSession } from '$lib/modules/requests';
  import { generateLibp2pPeerId, libp2pIssueToken, startLibp2pNode, stopNode } from '$lib/modules/p2p/libp2pUtil';
  import { KEEP_ALIVE } from '@libp2p/interface';
  import { CustomError, displayError } from '$lib/modules/errors';
  import { session } from '$lib/stores/account';
  import { formatDuration, randomFourDigitsCode, writeValueToClipboard } from '$lib/modules/utils';
  import hashFile from '$lib/modules/hashFile';
  import Tag from '$lib/components/common/Tag.svelte';
  import { minuteTimer } from '$lib/stores/timers';
  import WarningIcon from '$lib/components/materialIcons/WarningIcon.svelte';
  import { createCompressionStream } from '$lib/modules/compression/compressionUtils';

  const SENDING_STEPS = [
    { labels: ['Connecting to relay...', 'Connected to relay.'], action: connectToRelay },
    { labels: ['Sending invite to recipient...', 'Invite sent to recipient.'], action: sendInviteToRecipient }
  ];

  const RELAY_ADDRESS = '/dns4/p2p-relay-1.privacyportal.org/tcp/443/wss';

  export let nickname;
  export let recipient;
  export let file;
  export let fileHash;
  export let sending = false;

  let stoppingNode = false;
  let sendingStep = 0;
  let transfersInProgress = 0;
  let transfersCompleted = 0;
  let error;
  let code;
  let sessionExpires;
  let node;
  let address;
  let copied = false;
  let copyTimeout;

  $: sessionTTL = sessionExpires && sessionExpires > $minuteTimer ? sessionExpires - $minuteTimer : 0;

  // stop connections on expiration
  $: node?.status === 'started' && sessionTTL === 0 && stopNode().catch(console.error);

  async function copyToClipboard() {
    clearTimeout(copyTimeout);
    writeValueToClipboard(code);
    copied = true;
    copyTimeout = setTimeout(() => {
      copied = false;
    }, 3000);
  }

  async function createSession(peerId) {
    // issue token proving ownership of peerId
    const token = await libp2pIssueToken({
      peerId,
      data: {
        sub: $session.sub,
        size: file.size.toString(),
        hash: fileHash,
        iat: Date.now()
      }
    });

    // create session
    const response = await createFileSharingSession({
      peer_id: peerId.toString(),
      token,
      size: file.size.toString(),
      hash: fileHash
    });
    return response.data;
  }

  async function connectToRelay() {
    try {
      const peerId = await generateLibp2pPeerId();
      const session = await createSession(peerId);

      // store session expiration
      sessionExpires = session.expires;

      node = await startLibp2pNode({
        peerId,
        session,
        isSender: true
      });

      node.handle(
        '/file-transfer/1.0.0',
        async ({ connection, stream, protocol }) => {
          try {
            transfersInProgress++;
            // compress then transfer
            const compressionStream = await createCompressionStream();
            await stream.sink(file.stream().pipeThrough(compressionStream));
            transfersCompleted++;
          } catch (err) {
            console.error(err);
          } finally {
            transfersInProgress--;
          }
        },
        {
          maxInboundStreams: 100,
          maxOutboundStreams: 100
        }
      );

      let connection;
      while (!connection && node.status === 'started') {
        try {
          connection = await node.dial(multiaddr(RELAY_ADDRESS));
          console.log(`Connected to the relay ${connection.remotePeer.toString()}`);
        } catch (err) {
          console.error(`failed to connect to relay. Will try again in 5 seconds.`, err);
        }
        // wait 5 seconds between attempts
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (!connection || node.status !== 'started') throw new Error('Unable to connect to relay.');

      await node.peerStore.patch(connection.remotePeer, {
        tags: {
          [KEEP_ALIVE]: true
        }
      });

      // make a reservation
      await node.components.transportManager.transports.get('@libp2p/circuit-relay-v2-transport').reservationStore.addRelay(connection.remotePeer);

      // store the relayed address
      address = `${RELAY_ADDRESS}/p2p/${connection.remotePeer.toString()}/p2p-circuit/webrtc/p2p/${node.peerId.toString()}`;
    } catch (err) {
      console.error(err);
      if (err instanceof CustomError) throw err;
      throw new CustomError({ message: 'Failed to connect to relay. Please try again.' });
    }
  }

  async function sendInviteToRecipient() {
    try {
      // generate 4 digits code
      let generatedCode = randomFourDigitsCode();
      await createFileSharingInvite({
        nickname,
        recipient,
        address,
        code: generatedCode
      });

      // display code
      code = generatedCode;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError({ message: 'Unable to prepare file for transfer. Please try again.' });
    }
  }

  async function handleClose() {
    stoppingNode = false;
    code = undefined;
    nickname = undefined;
    recipient = undefined;
    sending = false;
    file = undefined;
    sessionExpires = undefined;
    transfersInProgress = 0;
    transfersCompleted = 0;
  }

  async function handleCancellation() {
    stoppingNode = true;
    await stopNode().catch(console.error);
    handleClose();
  }

  onMount(async () => {
    try {
      for (sendingStep = 0; sendingStep < SENDING_STEPS.length; sendingStep++) {
        await SENDING_STEPS[sendingStep].action();
      }
    } catch (err) {
      error = err;
      displayError(err);
    }
  });

  onDestroy(async () => {
    if (node) await stopNode(node).catch(console.error);
  });
</script>

<FlexContainer column align_items="center" justify_content="center" padding="0.5rem" gap="0.5rem">
  <GridContainer width="100%" align_items="center" justify_items="start" template_columns="15px auto" padding="0.5rem" gap="0.3rem">
    {#each SENDING_STEPS as step, index}
      {#if index < sendingStep}
        <CheckCircleIcon dimension="15px" />
        <span class="sm">{step.labels[1]}</span>
      {:else if index === sendingStep}
        {#if error}
          <CloseIcon dimension="15px" color="var(--danger-color)" />
        {:else}
          <RefreshIcon animated dimension="15px" />
        {/if}
        <span class="sm">{step.labels[0]}</span>
      {/if}
    {/each}
    {#if sendingStep >= SENDING_STEPS.length}
      {#if sessionTTL > 0}
        <RefreshIcon animated dimension="15px" />
        {#if transfersInProgress}
          <span class="sm">Transferring file to {transfersInProgress > 1 ? `${transfersInProgress} recipients` : 'recipient'}... </span>
        {:else}
          <span class="sm">Waiting for recipient to connect... ({formatDuration(sessionTTL, { raw: true })} left)</span>
        {/if}
        {#if transfersCompleted > 0}
          <div class="full-line">
            <Tag backgroundColor="var(--positive-color)">{transfersCompleted > 1 ? `${transfersCompleted} transfers` : '1 transfer'}</Tag>
          </div>
        {/if}
      {:else}
        <WarningIcon color="var(--warning-color)" dimension="15px" />
        <span class="sm">Session Expired. Connection closed.</span>
      {/if}
    {/if}
  </GridContainer>
  {#if code && sessionTTL > 0}
    <Button on:click={copyToClipboard} width="100%" height="auto" padding="0.5rem" basic rounded>
      <FlexContainer column>
        <GridContainer template_columns="1fr 1fr 1fr 1fr" padding="0.5rem">
          <span class="code mono">{code[0]}</span>
          <span class="code mono">{code[1]}</span>
          <span class="code mono">{code[2]}</span>
          <span class="code mono">{code[3]}</span>
        </GridContainer>
        <h6 class="no-margin"><small>{copied ? 'copied to clipboard' : 'VERIFICATION CODE'}</small></h6>
      </FlexContainer>
    </Button>
  {/if}
  {#if sessionTTL > 0}
    <Button on:click={handleCancellation} width="100%" basic rounded disabled={stoppingNode}>Cancel</Button>
  {:else}
    <Button on:click={handleClose} width="100%" basic rounded>Close</Button>
  {/if}
</FlexContainer>

<style>
  span.code {
    font-size: x-large;
  }
</style>
