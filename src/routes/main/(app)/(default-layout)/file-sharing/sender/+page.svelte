<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import LockIcon from '$lib/components/materialIcons/LockIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import FilePicker from '$lib/components/common/FilePicker.svelte';
  import VisibilityOffIcon from '$lib/components/materialIcons/VisibilityOffIcon.svelte';
  import { isEnhancedProtection } from '$lib/stores/account';
  import PrintIcon from '$lib/components/materialIcons/PrintIcon.svelte';
  import LargeFileIcon from '$lib/components/materialIcons/LargeFileIcon.svelte';
  import { fmtSize } from '$lib/modules/utils';
  import FileSender from './FileSender.svelte';
  import InfoIcon from '$lib/components/materialIcons/InfoIcon.svelte';
  import Tooltip from '$lib/components/common/Tooltip.svelte';
  import { CustomError, DEFAULT_ERROR_MESSAGE, displayError } from '$lib/modules/errors';
  import hashFile from '$lib/modules/hashFile';
  import QrCode from '$lib/components/common/QrCode.svelte';

  const MAX_ERR_MSG_LENGTH = 300;
  const MAX_FILE_SIZE = {
    enhanced: 30 * 1048476,
    basic: 1048476
  }

  let nickname;
  let recipient;
  let file;
  let fileHash;
  let inviteURL;
  let sending = false;
  let loading = true;

  $: prepareFile(file);

  async function prepareFile(file) {
    try {
      fileHash = file ? await hashFile(file) : undefined;
    } catch (err) {
      console.error('File hashing failed with error:', err);
      throw new CustomError({ message: 'Unable to prepare file for transfer. Please try again.' });
    }
  }

  function checkErrorMessage(message) {
    // remove all unsafe characters (very strict)
    return (message && message.replaceAll(/[^a-zA-Z0-9 \-_]/g, '').substring(0, MAX_ERR_MSG_LENGTH)) || DEFAULT_ERROR_MESSAGE;
  }

  async function handleShareTarget() {
    if ($page.url.searchParams.has('share-target')) {
      if ($page.url.searchParams.has('err')) {
        throw new CustomError({ message: checkErrorMessage($page.url.searchParams.get('err')) })
      } else {
        const keys = await caches.keys();
        const fsCacheName = keys.filter((key) => key.endsWith('file-sharing')).sort().pop();
        if (fsCacheName) {
          const fsCache = await caches.open(fsCacheName);
          const cachedFile = await fsCache.match('pdf-file');
          if (cachedFile) {
            const blob = await cachedFile.blob();
            await fsCache.delete('pdf-file');
            const pdfFile = new File([blob], 'ephemeral.pdf', { type: blob.type });
            const maxFileSize = isEnhancedProtection ? MAX_FILE_SIZE.enhanced : MAX_FILE_SIZE.basic;
            if (pdfFile.size > maxFileSize) {
              throw new CustomError({ message: `File size cannot exceed ${fmtSize(maxFileSize)}.${isEnhancedProtection ? '' : ' Please upgrade to share larger files.'}` })
            }
            file = pdfFile;
          }
        }
      }
    }
  }

  onMount(async () => {
    try {
      loading = true;
      await handleShareTarget();
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
    
  });
</script>

{#if file}
  <FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
    <FlexContainer width="100%" align_items="center" justify_content="flex-start">
      <h1 class="no-margin">File Sharing</h1>
    </FlexContainer>
    <FlexContainer column align_items="center" justify_content="center" bgColor="var(--new-layer-color)" gap="0px" rounded>
      <GridContainer align_items="center" template_columns="40% 1fr" gap="0px">
        {#if inviteURL}
          <div>
            <QrCode bind:value={inviteURL} />
          </div>
        {:else}
          <FlexContainer width="100%" align_items="center" justify_content="center" column gap="0.5rem" relative>
            <LargeFileIcon dimension="100%" />
            <div class="overlay">
              <FlexContainer height="100%" column align_items="center" justify_content="center">
                <span class="sm"><strong>PDF</strong></span>
              </FlexContainer>
            </div>
          </FlexContainer>
        {/if}
        <GridContainer template_columns="1fr" padding="0px 1rem 0px 0px" gap="0.5rem">
          <FlexContainer column align_items="start" justify_content="flex-start" gap="0.2rem">
            <span class="sm mono oneline">{file.name}</span>
            <span class="xs mono oneline"><strong>Name</strong></span>
          </FlexContainer>
          <FlexContainer column align_items="start" justify_content="flex-start" gap="0.2rem">
            <span class="sm mono oneline">{fmtSize(file.size)}</span>
            <span class="xs mono oneline"><strong>Size</strong></span>
          </FlexContainer>
        </GridContainer>
      </GridContainer>
      <hr class="divider thin no-margin" />

      {#if sending && fileHash}
        <FileSender bind:recipient bind:nickname bind:file {fileHash} bind:sending bind:inviteURL />
      {:else}
        <FlexContainer column gap="1.5rem">
          <Form on:submit={() => (sending = true)}>
            <FlexContainer column gap="1rem" padding="1rem">
              <FlexContainer column align_items="start" gap="0.3rem">
                <h5 class="no-margin">Recipient:</h5>
                <Input wide type="email" name="email" placeholder="Email Address" autocomplete="off" focus bind:value={recipient} disabled={sending} />
              </FlexContainer>
              <FlexContainer column align_items="start" gap="0.3rem">
                <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
                  <h5 class="no-margin">Your Name (optional):</h5>
                  <Tooltip position="left" text="A good pseudonym can make your invite more natural." small>
                    <InfoIcon dimension="15px" color="var(--primary-text-color)" />
                  </Tooltip>
                </FlexContainer>
                <Input wide type="text" name="nickname" placeholder="Anon" autocomplete="off" required={false} bind:value={nickname} disabled={sending} />
              </FlexContainer>
              <GridContainer template_columns="1fr 1fr" mobile_template_columns="1fr" gap="0.5em">
                <Button width="100%" on:click={() => (file = undefined)} basic rounded>Cancel</Button>
                <Button width="100%" type="submit" disabled={!file || sending} rounded primary>Send Invite</Button>
              </GridContainer>
            </FlexContainer>
          </Form>
        </FlexContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>
{:else}
  <Section padding="0px 1rem" height="max(calc(100vh - 50px), 500px)" color="var(--text-color)" textCentered relative>
    <FlexContainer width="auto" column align_items="center" justify_content="space-between">
      <FlexContainer column align_items="center" justify_content="center" gap="1rem" width="auto">
        <FlexContainer width="auto" column align_items="center" justify_content="center" gap="0.5rem">
          <Logo dimension="8rem" color="var(--primary-color)" opacity="1" animated={loading} />
          <h4 class="no-margin unselectable">File Sharing</h4>
          <span class="sm unselectable">Your personal info remains private.</span>
        </FlexContainer>
        {#if !loading}
          <br />
          <FlexContainer width="auto" column gap="1.5rem">
            <FilePicker
              maxSize={isEnhancedProtection ? MAX_FILE_SIZE.enhanced : MAX_FILE_SIZE.basic}
              width="100%"
              height="auto"
              padding="0.1rem 0.5rem 0.1rem 0.3rem"
              disabled={sending}
              accept="application/pdf"
              gap="0.1rem"
              basic
              border
              rounded
              bind:file
            >
              <FlexContainer column gap="0.3rem" padding="0.5rem 1rem">
                <FlexContainer align_items="center" justify_content="center" gap="0.3rem">
                  <strong><small>Select PDF File</small></strong>
                </FlexContainer>
                {#if isEnhancedProtection}
                  <span class="xs">Size cannot exceed 30MB.</span>
                {:else}
                  <span class="xs">Size cannot exceed 1MB with Basic Protection.</span>
                {/if}
              </FlexContainer>
            </FilePicker>

            <span class="xs">For better privacy, use password protected PDFs.</span>
          </FlexContainer>
        {/if}
      </FlexContainer>
    </FlexContainer>

    <div class="footer" slot="footer">
      <FlexContainer width="100%" align_items="center" justify_content="center" padding="1rem 0px 1rem 0px">
        <FlexContainer width="auto" padding="1rem 2rem" gap="2rem" bgColor="var(--down-layer-color)" rounded>
          <Tooltip text="The connection is end-to-end encrypted and relayed through our servers." small>
            <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
              <div class="justify-self-end">
                <LockIcon width="auto" dimension="14px" />
              </div>
              <span class="xs oneline unselectable">E2EE</span>
            </GridContainer>
          </Tooltip>
          <Tooltip text="Your personal information is not shared with the recipient." small>
            <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
              <div class="justify-self-end">
                <VisibilityOffIcon width="auto" dimension="14px" />
              </div>
              <span class="xs oneline unselectable">Private</span>
            </GridContainer>
          </Tooltip>
          <Tooltip text="The recipient can print the file previewed in the browser without saving it to disk." small>
            <GridContainer width="auto" align_items="center" justify_items="start" template_columns="auto auto" gap="0.4rem">
              <div class="justify-self-end">
                <PrintIcon width="auto" dimension="14px" />
              </div>
              <span class="xs oneline unselectable">Print Ready</span>
            </GridContainer>
          </Tooltip>
        </FlexContainer>
      </FlexContainer>
    </div>
  </Section>
{/if}

<style>
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: calc(100% - 2rem);
  }
</style>
