<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { createNewApiKey } from '$lib/modules/requests';
  import { writeValueToClipboard } from '$lib/modules/utils';

  export let handleClose;
  export let pushNewApiKey;

  let loading = false;
  let key;
  let secret;
  let label;

  let submitting = false;

  let clipboard = {};
  let clipboardTimeout = {};

  async function copyToClipboard(type, value) {
    clearTimeout(clipboardTimeout?.[type]);
    writeValueToClipboard(value);
    clipboard[type] = true;
    clipboardTimeout[type] = setTimeout(() => {
      clipboard[type] = false;
    }, 3000);
  }

  async function handleNewApiKey() {
    submitting = true;
    try {
      const { data } = await createNewApiKey({ label });

      key = data.key;
      secret = data.secret;

      pushNewApiKey({ ...data });
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      submitting = false;
    }
  }
</script>

<FlexContainer column gap="0.5rem" padding="0.5rem 1rem 1rem 1rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">New API Key</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  {#if secret}
    <FlexContainer column gap="0.5rem">
      <Button on:click={() => copyToClipboard('key', key)} basic padding="0px 0.5rem" rounded>
        <GridContainer margin="0 0 0 0" padding="0.5rem" justify_items="stretch" template_columns="1fr auto" align_items="center" gap="0.7rem" rounded>
          <FlexContainer column align_items="start" nooverflow>
            <h6 class="no-margin oneline mono">{key}</h6>
            <span class="xs">Key</span>
          </FlexContainer>
          {#if clipboard?.key}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </GridContainer>
      </Button>
      <Button on:click={() => copyToClipboard('secret', secret)} basic padding="0px 0.5rem" rounded>
        <GridContainer margin="0 0 0 0" padding="0.5rem" justify_items="stretch" template_columns="1fr auto" align_items="center" gap="0.7rem" rounded>
          <FlexContainer column align_items="start" nooverflow>
            <h6 class="no-margin oneline mono">{secret}</h6>
            <span class="xs">Secret</span>
          </FlexContainer>
          {#if clipboard?.secret}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </GridContainer>
      </Button>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Make sure to copy your key secret now. You won't be able to view it again.</span>
      </GridContainer>
    </FlexContainer>

    <Button on:click={handleClose} width="100%" height="100%" padding="0.5rem 0" basic border rounded disabled={loading}>Close</Button>
  {:else}
    <FlexContainer column gap="0.5rem" nooverflow>
      <Form on:submit={handleNewApiKey} width="100%">
        <FlexContainer column gap="0.5rem">
          <Input type="text" placeholder="Label" maxlength="50" bind:value={label} />
          <Button type="submit" primary rounded disabled={submitting}>
            {#if submitting}
              Creating Key...
            {:else}
              Create Key
            {/if}
          </Button>
        </FlexContainer>
      </Form>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">API keys are valid for 90 days.</span>
      </GridContainer>
    </FlexContainer>
  {/if}
</FlexContainer>
