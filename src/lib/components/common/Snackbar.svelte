<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Wrapper from '$lib/components/common/Wrapper.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import { closeAllSnackbars, closeSnackbar, messages as messagesStore } from '$lib/stores/snackbar';
  import { onDestroy } from 'svelte';

  let messages;

  const unsubscribeMessageStore = messagesStore.subscribe((newMessages) => {
    messages = newMessages;
  });

  function closeOnEscape(e) {
    if (e.key === 'Escape') closeAllSnackbars();
  }

  onDestroy(unsubscribeMessageStore);
</script>

<svelte:window on:keydown|stopPropagation={closeOnEscape} />

<Wrapper position="fixed" zindex="10000" wide center>
  <FlexContainer column justify_content="center" gap="0.5rem">
    {#each messages as message}
      <div class="snackbar">
        <span class="text">{message.text}</span>
        <Button on:click={() => closeSnackbar(message.id)} blendin rounded>
          <CloseIcon color="var(--snackbar-color)" dimension="24px" />
        </Button>
      </div>
    {/each}
  </FlexContainer>
</Wrapper>

<style>
  .snackbar {
    display: grid;
    grid-template-columns: 1fr 24px;
    align-items: center;
    justify-content: center;
    background-color: var(--snackbar-bg-color);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    text-align: center; /* Centered text */
    border-radius: 10px; /* Rounded borders */
    padding: 16px; /* Padding */
    overflow: hidden;
  }

  .snackbar:first-child {
    margin-top: 1rem;
  }

  .snackbar .text {
    flex-grow: 1;
    min-width: 0; /* https://stackoverflow.com/a/36231105 */
    color: var(--snackbar-color);
  }
</style>
