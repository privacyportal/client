<script>
  import PwdStrengthTasks from '$lib/modules/pwdStrength/PwdStrengthTasks';
  import { onDestroy, onMount } from 'svelte';

  export let password;
  export let strength = undefined;

  let pwdStrengthTasks;

  $: {
    if (password && pwdStrengthTasks) {
      strength = undefined;
      pwdStrengthTasks
        .checkPwdStrength(password)
        .then(({ score }) => (strength = score))
        .catch(() => (strength = undefined));
    } else {
      strength = undefined;
    }
  }

  onMount(() => {
    pwdStrengthTasks = new PwdStrengthTasks();
  });

  onDestroy(() => {
    if (pwdStrengthTasks) {
      pwdStrengthTasks.cleanup();
    }
  });
</script>

{#if strength !== undefined}
  <div class="gauge">
    {#each [0, 1, 2, 3, 4] as level}
      <div class="segment level-{strength}" class:filled={strength !== undefined ? strength >= level : undefined}></div>
    {/each}
  </div>
{/if}

<style>
  .gauge {
    display: flex;
    overflow: hidden;
    border-radius: 15px;
    border: 1.5px solid var(--border-color);
    width: 100%;
    max-width: 100px;
    gap: 2.5px;
    background-color: var(--border-color);
  }

  .segment {
    width: calc(20% - 2px);
    height: 5px;
    background-color: var(--new-layer-x2-color);
  }

  .segment.filled.level-0 {
    background-color: #ff0000;
  }
  .segment.filled.level-1 {
    background-color: #ff9900;
  }
  .segment.filled.level-2 {
    background-color: #ffff00;
  }
  .segment.filled.level-3 {
    background-color: #99ff00;
  }
  .segment.filled.level-4 {
    background-color: #00ff00;
  }
</style>
