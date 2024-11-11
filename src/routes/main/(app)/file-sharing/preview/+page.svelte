<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import LockIcon from '$lib/components/materialIcons/LockIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { onMount } from 'svelte';
  import VisibilityOffIcon from '$lib/components/materialIcons/VisibilityOffIcon.svelte';
  import PrintIcon from '$lib/components/materialIcons/PrintIcon.svelte';
  import { fmtSize, isValidUUID } from '$lib/modules/utils';
  import { page } from '$app/stores';
  import { getFileSharingInvite } from '$lib/modules/requests';
  import FileReceiver from './FileReceiver.svelte';
  import { generateLibp2pPeerId, libp2pIssueToken } from '$lib/modules/p2p/libp2pUtil';
  import { goto } from '$app/navigation';
  import WarningIcon from '$lib/components/materialIcons/WarningIcon.svelte';

  let verificationCodeForm;
  let inviteId;
  let peerId;
  let loading = true;
  let code;
  let remoteAddress;
  let turnCredentials;
  let fileHash;
  let fileSize;
  let receiving = false;
  let file;
  let pdfViewer;
  let error;

  $: if (file && pdfViewer) {
    pdfViewer.src = URL.createObjectURL(file);
    // setTimeout(() => {
    //   pdfViewer.contentWindow.print();
    // }, 200);
  }

  // submit form if code length === 4
  $: code?.length === 4 && fetchInviteInfo().catch(console.error);

  async function parseInviteId() {
    try {
      inviteId = $page.url.searchParams.get('id');
      if (!inviteId || !isValidUUID(inviteId)) {
        error = new Error('Invalid invite.');
        throw error;
      }
    } catch (err) {
      // redirect to main page
      setTimeout(() => goto('/', { replaceState: true }), 30_000);
    } finally {
      loading = false;
    }
  }

  async function fetchInviteInfo() {
    try {
      loading = true;
      // create peerId
      peerId = await generateLibp2pPeerId();

      // issue token
      const token = await libp2pIssueToken({
        peerId,
        data: {
          sub: inviteId,
          iat: Date.now()
        }
      });

      const response = await getFileSharingInvite({
        id: inviteId,
        peer_id: peerId.toString(),
        token,
        code
      });

      console.log(response.data);
      remoteAddress = response.data?.address;
      turnCredentials = response.data?.turn;
      fileHash = response.data?.hash;
      fileSize = parseInt(response.data?.size);

      if (!remoteAddress || !fileHash || !fileSize || !turnCredentials || !turnCredentials?.username || !turnCredentials?.credential) {
        throw new Error('Invalid Server Response.');
      }
    } catch (err) {
      // reset code
      code = undefined;
      loading = false;
      console.error(err);
      // redirect to main page
      setTimeout(() => goto('/', { replaceState: true }), 30_000);
    }
  }

  onMount(async () => {
    await parseInviteId();
  });
</script>

{#if file}
  <iframe bind:this={pdfViewer} title="PDF document" width="100%" height="100%"> </iframe>
{:else}
  <Section padding="0px 1rem" height="calc(100vh - 50px)" color="var(--text-color)" gap="3rem" textCentered relative>
    <FlexContainer width="auto" column align_items="center" justify_content="center" gap="0.5rem">
      <Logo dimension="8rem" color={error ? 'var(--disabled-color)' : 'var(--primary-color)'} opacity="1" />
      <h4 class="no-margin">File Sharing</h4>
    </FlexContainer>
    <FlexContainer width="auto" column align_items="center" justify_content="space-between">
      <FlexContainer column align_items="center" justify_content="center" gap="3rem" width="auto">
        {#if error}
          <GridContainer width="auto" align_items="center" template_columns="30px 1fr" gap="0.5rem">
            <WarningIcon color="var(--danger-color)" dimension="30px" />
            <h3 class="no-margin">{error.message}</h3>
          </GridContainer>
        {:else if remoteAddress}
          <FileReceiver {peerId} {remoteAddress} {turnCredentials} {fileHash} {fileSize} bind:receiving bind:file />
        {:else if !loading}
          <FlexContainer column gap="1.5rem">
            <Form bind:element={verificationCodeForm} on:submit={fetchInviteInfo}>
              <FlexContainer column gap="1rem" padding="1rem" bgColor="var(--new-layer-color)" rounded>
                <FlexContainer column align_items="start" gap="0.3rem">
                  <h5 class="no-margin">Enter Verification Code:</h5>
                  <Input
                    wide
                    type="text"
                    name="code"
                    placeholder="code"
                    autocomplete="off"
                    pattern="[0-9]+"
                    minlength={4}
                    maxlength={4}
                    required={false}
                    focus={!loading}
                    bind:value={code}
                    disabled={loading}
                  />
                </FlexContainer>
              </FlexContainer>
            </Form>
          </FlexContainer>
        {:else}
          <FlexContainer column gap="1.5rem">
            <h3>Loading...</h3>
          </FlexContainer>
        {/if}
      </FlexContainer>
    </FlexContainer>

    <div class="footer" slot="footer">
      <FlexContainer width="100%" align_items="center" justify_content="center" padding="1rem 0px 1rem 0px">
        <FlexContainer width="auto" padding="1rem 2rem" gap="2rem" bgColor="var(--down-layer-color)" rounded>
          <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
            <div class="justify-self-end">
              <LockIcon width="auto" dimension="14px" />
            </div>
            <span class="xs oneline">E2E Encrypted</span>
          </GridContainer>
          <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
            <div class="justify-self-end">
              <VisibilityOffIcon width="auto" dimension="14px" />
            </div>
            <span class="xs oneline">Private</span>
          </GridContainer>
          <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
            <div class="justify-self-end">
              <PrintIcon width="auto" dimension="14px" />
            </div>
            <span class="xs oneline">Print Ready</span>
          </GridContainer>
        </FlexContainer>
      </FlexContainer>
    </div>
  </Section>
{/if}

<style>
  .footer {
    position: absolute;
    bottom: 0;
    width: calc(100% - 2rem);
  }
</style>
