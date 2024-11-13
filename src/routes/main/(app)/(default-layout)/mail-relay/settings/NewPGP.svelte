<script>
  import Button from '$lib/components/common/Button.svelte';
  import FilePicker from '$lib/components/common/FilePicker.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import MultiStep from '$lib/components/common/MultiStep.svelte';
  import TextArea from '$lib/components/common/TextArea.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import { activateProfile, createPGPProfile } from '$lib/modules/requests';
  import { profiles as profilesStore } from '$lib/stores/profiles';
  import AddIcon from '$lib/components/materialIcons/AddIcon.svelte';
  import { isPublicPGPKey } from '$lib/modules/pgpUtils';
  import { showSnackbar } from '$lib/stores/snackbar';

  export let accountId;
  export let handleClose;
  let submitting = false;
  let activating = false;
  let key;
  let progressIndex;
  let newProfile;
  let scrollableContainer;

  function nextStep() {
    progressIndex++;
    scrollableContainer.scrollTop = 0;
  }

  async function handleSubmitPGPKey() {
    submitting = true;
    try {
      const { data } = await createPGPProfile({ accountId, key });
      console.log(data);
      profilesStore.update((profilesArr) => [data, ...profilesArr]);
      newProfile = data;
      // move to next step;
      nextStep();
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      submitting = false;
    }
  }

  async function handleActivateProfile() {
    activating = true;
    try {
      await activateProfile({ accountId: newProfile.acct_id, id: newProfile.id });
      profilesStore.update((profilesArr) => {
        return profilesArr.map((p) => (p.id === newProfile.id || p.enabled === true ? Object.assign(p, { enabled: p.id === newProfile.id }) : p));
      });
      handleClose();
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      activating = false;
    }
  }

  function validatePgpFile(data) {
    if (!isPublicPGPKey(data)) {
      showSnackbar({ text: 'File should contain a PGP public key.' });
      return false;
    }
    return true;
  }
</script>

<!-- Step 1: Export PGP Public Key -->
<!-- Step 2: Submit Public Key -->
<FlexContainer height="100%" align_items="stretch" bgColor="var(--new-layer-color)" padding="0.5rem 0.1rem" rounded>
  <FlexContainer column gap="0.5rem">
    <FlexContainer column gap="0.5rem" padding="0 0.9rem">
      <h4 class="no-margin">New PGP Profile</h4>
      <MultiStep bind:progressIndex nodes={[{ text: 'Export' }, { text: 'Submit' }, { text: 'Activate' }]} />
      <hr class="sm-v-margin divider" />
    </FlexContainer>
    <FlexContainer column gap="0.5rem" padding="0 0.9rem" nooverflow bind:element={scrollableContainer}>
      {#if progressIndex === 0}
        <h5 class="no-margin">Export Public Key</h5>
        <span
          ><small
            ><strong>Go to</strong> the PGP settings of your favorite email client. <strong>Locate</strong> your PGP key or generate a new one. Then, <strong>copy</strong> your public PGP key to the clipboard
            (or export it into a file).</small
          ></span
        >
        <Button on:click={nextStep} padding="0.5rem 0" primary rounded>Continue</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">Make sure your email client supports PGP.</span>
        </GridContainer>
      {:else if progressIndex === 1}
        <Form on:submit={handleSubmitPGPKey}>
          <FlexContainer column gap="0.5rem">
            <FlexContainer gap="0.5rem" align_items="center" justify_content="space-between">
              <h5 class="no-margin">Submit Key</h5>
              <FilePicker validate={validatePgpFile} readAsText height="auto" padding="0.1rem 0.5rem 0.1rem 0.3rem" disabled={submitting} accept=".asc" gap="0.1rem" basic rounded bind:content={key}
                ><AddIcon dimension="18px" color="var(--basic-text-color)" /><small>Import</small></FilePicker
              >
            </FlexContainer>
            <TextArea name="key" placeholder="Insert Public PGP Key (or drag the file here)" bind:value={key} disabled={submitting} acceptFileDrop={true} />
            <Button padding="0.5rem 0px" type="submit" disabled={submitting} primary rounded>Submit</Button>
            <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
              <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
              <span class="note">If you have a PGP file, you can also open it using your favorite text editor, copy its contents, then paste it in the text area above.</span>
            </GridContainer>
          </FlexContainer>
        </Form>
      {:else if progressIndex === 2}
        <h5 class="no-margin">Activate Profile</h5>
        <span><small>Set this profile as default to use it for encrypting all incoming mail.</small></span>
        <Button on:click={handleActivateProfile} disabled={activating} padding="0.5rem 0" primary rounded>Set as Default</Button>
        <Button on:click={handleClose} padding="0.5rem 0" basic rounded>Close</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">You can modify the default profile later from the profiles list.</span>
        </GridContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>
</FlexContainer>
