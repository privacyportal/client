<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import { printServiceDialogProgress, showPrintServiceDialog, printServiceDialogOnCancel } from '$lib/stores/pdfPreview';
</script>

<Modal bind:open={$showPrintServiceDialog} ignoreOutsideClicks={true} minWidth="250px">
  <FlexContainer column bgColor="var(--new-layer-color)" padding="0.5rem">
    <span class="sm">Preparing document for printing…</span>
    <FlexContainer gap="0.5rem">
      <progress value={$printServiceDialogProgress} max="100"></progress>
      <span class="relative-progress">{$printServiceDialogProgress}%</span>
    </FlexContainer>
    <Button on:click={$printServiceDialogOnCancel} padding="0px 0.5rem" basic rounded>
      <span class="sm">Cancel</span>
    </Button>
  </FlexContainer>
</Modal>
