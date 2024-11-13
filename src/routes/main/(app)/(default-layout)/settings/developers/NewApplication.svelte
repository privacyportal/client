<script>
  import { goto } from '$app/navigation';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { registerOAuthApplication } from '$lib/modules/requests';

  export let handleClose;

  let submitting = false;
  let name;
  let url;
  let callback_url;

  async function registerApplication() {
    submitting = true;
    try {
      const { data } = await registerOAuthApplication({ name, url, callback_urls: [callback_url] });
      handleClose();
      goto(`/settings/applications/${data.id}`);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      submitting = false;
    }
  }
</script>

<FlexContainer column gap="1.5rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">New Application</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  <form on:submit|preventDefault={registerApplication}>
    <FlexContainer column gap="1rem">
      <FlexContainer column gap="0.5rem">
        <h5 class="no-margin">Name</h5>
        <Input type="text" name="name" placeholder="Application Name" minlength="1" required autocomplete="off" bind:value={name} disabled={submitting} />
      </FlexContainer>

      <FlexContainer column gap="0.5rem">
        <h5 class="no-margin">Homepage URL</h5>
        <Input type="text" name="url" placeholder="https://<app.url>" required autocomplete="off" bind:value={url} disabled={submitting} />
      </FlexContainer>

      <FlexContainer column gap="0.5rem">
        <h5 class="no-margin">Callback URL</h5>
        <Input type="text" name="url" placeholder="https://<app.url>/callback" required autocomplete="off" bind:value={callback_url} disabled={submitting} />
      </FlexContainer>

      <Button type="submit" primary rounded disabled={submitting}>
        {#if submitting}
          Registering...
        {:else}
          Register
        {/if}
      </Button>

      <GridContainer template_columns="18px auto" align_items="center" margin="0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">The app name must be recognizable by users.</span>
      </GridContainer>
    </FlexContainer>
  </form>
</FlexContainer>
