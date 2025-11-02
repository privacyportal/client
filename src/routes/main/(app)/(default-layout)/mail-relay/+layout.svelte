<script>
  import { loadServiceKeys } from '$lib/modules/crypto/e2eeUtil';
  import { cleanupCryptoTasks, e2eeMasterKey, e2eeServiceKeys, session, setupCryptoTasks } from '$lib/stores/account';
  import { onDestroy, onMount } from 'svelte';

  // load E2EE wrapping key
  $: if ($session && $e2eeServiceKeys && $e2eeMasterKey) {
    setupCryptoTasks();
  }

  onMount(async () => {
    if ($session.e2ee) {
      await loadServiceKeys('mrelay');
    }
  });

  onDestroy(() => {
    cleanupCryptoTasks();
  });
</script>

<slot />
