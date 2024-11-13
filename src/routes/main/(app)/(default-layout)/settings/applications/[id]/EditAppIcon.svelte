<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { displayError } from '$lib/modules/errors';
  import { uploadOAuthAppIcon } from '$lib/modules/requests';
  import { showSnackbar } from '$lib/stores/snackbar';

  export let handleClose;
  export let clientId;
  export let icon;

  let uploadingIcon = false;
  let iconInputElement;
  let showUploadButton = false;
  let preview;

  async function uploadIcon() {
    const curFiles = iconInputElement.files;
    console.log(curFiles);

    const formData = new FormData();
    formData.append('icon', curFiles[0]);

    try {
      uploadingIcon = true;
      await uploadOAuthAppIcon({ id: clientId, formData });
      showSnackbar({ text: 'Icon uploaded successfully.' });
      handleClose(true);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      uploadingIcon = false;
    }
  }

  function handleSelectionChanged() {
    if (iconInputElement?.files?.length === 1) {
      const file = iconInputElement.files[0];
      if (file.size <= 102400) {
        icon = URL.createObjectURL(file);
        showUploadButton = true;
      } else {
        showSnackbar({ text: 'File size must not exceed 100KB.' });
        showUploadButton = false;
      }
    } else {
      showUploadButton = false;
    }
  }
</script>

<FlexContainer column gap="1.5rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">Edit Icon</h3>

    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  <FlexContainer width="100%" justify_content="center">
    <FlexContainer height="120px" width="120px" bgColor="var(--new-layer-color)" roundedIcon>
      <img bind:this={preview} alt="icon" src={icon} class:hide={!icon} />
      {#if !icon}
        <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
      {/if}
    </FlexContainer>
  </FlexContainer>

  <FlexContainer column gap="0.5rem">
    <label id="choose_file" for="icon">Choose File</label>
    <input bind:this={iconInputElement} on:change={handleSelectionChanged} type="file" id="icon" name="icon" accept="image/png, image/jpeg" />

    {#if showUploadButton}
      <Button on:click={uploadIcon} primary rounded disabled={uploadingIcon}>
        {#if uploadingIcon}
          Uploading...
        {:else}
          Upload
        {/if}
      </Button>
    {/if}
    <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note">Only PNG or JPEG images of 200 x 200 pixels are accepted.</span>
    </GridContainer>
  </FlexContainer>
</FlexContainer>

<style>
  input[type='file'] {
    display: none;
  }

  label#choose_file {
    display: inline-flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 35px;
    width: 100%;
    background-color: var(--basic-color);
    color: var(--basic-text-color);
    border-radius: 6px;
    cursor: pointer;
  }

  label#choose_file:hover {
    filter: brightness(110%);
  }

  img.hide {
    display: none;
  }
</style>
