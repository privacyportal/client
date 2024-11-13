<script>
  import { endSession } from '$lib/stores/account';
  import { onMount } from 'svelte';

  onMount(endSession);
</script>
