<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import RefreshIcon from '$lib/components/materialIcons/RefreshIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let powChallenge;

  $: powPromise = runPOWVerification(powChallenge);

  async function runPOWVerification(powChallenge) {
    if (!powChallenge) return;
    let powResult = undefined;

    // start verification
    const powWorker = new Worker(new URL('../../../lib/modules/powWorker.js', import.meta.url), { type: 'module' });

    try {
      powResult = await new Promise((resolve, reject) => {
        powWorker.onerror = reject;
        powWorker.onmessage = function (event) {
          if (!event?.data?.pow_data?.pow) return reject(new Error('pow not found'));
          resolve(event.data.pow_data);
        };

        powWorker.postMessage(powChallenge);
      });

      dispatch('verified', { powResult });
    } catch (err) {
      console.error(err);
      dispatch('not_verified', {});
    } finally {
      powWorker.terminate();
    }

    return powResult;
  }
</script>

{#if powChallenge}
  {#await powPromise}
    <FlexContainer height="35px" align_items="center" justify_content="start" bgColor="var(--base-color)" padding="0.5rem" gap="0.3rem" border rounded>
      <RefreshIcon dimension="16px" animated /> <span>Not a robot?</span>
    </FlexContainer>
  {:then powResult}
    {#if powResult?.pow === undefined}
      <FlexContainer height="35px" align_items="center" justify_content="start" bgColor="var(--base-color)" padding="0.5rem" gap="0.3rem" border rounded>
        <span>verification failed</span>
      </FlexContainer>
    {/if}
  {/await}
{/if}
