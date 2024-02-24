<script>
  import { isDarkMode } from '$lib/stores/account';
  import QRCode from 'qrcode';

  export let value;
  $: svgPromise = value ? QRCode.toString(value, { type: 'svg', ...($isDarkMode ? { color: { light: '#00000000', dark: 'FFFFFFCC' } } : {}) }) : null;
</script>

{#if !!value}
  {#await svgPromise}
    <p>rendering...</p>
  {:then svg}
    {@html svg}
  {:catch}
    <p>Failed! Please try again later.</p>
  {/await}
{:else}
  <p>loading...</p>
{/if}
