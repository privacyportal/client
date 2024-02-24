<script>
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';

  export let borderColor = 'var(--border-color)';
  export let height = '100%';
  export let width = '15rem';
  export let padding = '0.7rem';
  export let title = '';
  export let mobile = false;
  export let noMobile = false;
  export let small = undefined;

  let opened = false;
  let opening = false;

  function toggleDropdown() {
    if (!opened) {
      opening = true;
    }
    opened = !opened;
  }

  function reset() {
    // prevent closing on click event bubble up
    if (opening) {
      opening = false;
    } else if (opened) {
      opened = false;
    }
  }

  function propagateIfButtonPress(e) {
    // this won't work if the button contains an svg icon
    if (e?.target?.tagName !== 'BUTTON' && e?.target?.parent?.tagName !== 'BUTTON') {
      e.stopPropagation();
    }
  }
</script>

<svelte:window on:click={reset} />

<div class="dropdown" style:--height={height} style:--width={width} style:--padding={padding} style:--border-color-override={borderColor} class:opened class:mobile class:no-mobile={noMobile}>
  <div class="value">
    {#if $$slots.hero}
      <slot name="hero" />
    {/if}

    <div on:click={toggleDropdown} class="title">
      {#if $$slots.title}
        <slot name="title" />
      {:else if title}
        <span>
          {#if small}
            <small>{title}</small>
          {:else}
            {title}
          {/if}
        </span>
      {/if}
      <ArrowDropDownIcon dimension={small ? '16.5' : '17'} />
    </div>
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={propagateIfButtonPress} class="dropdown-menu" class:has-title={!!title || !!$$slots.title}>
    <slot />
  </div>
</div>

<style>
  .dropdown {
    display: inline-flex;
    position: relative;
    height: var(--height);
    color: var(--text-color);
  }

  .title {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 2px;
  }

  .title > span {
    padding: 0.2rem 0px 0.2rem 0.2rem;
  }

  .value {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    border: 2px solid var(--border-color-override);
    cursor: pointer;
    overflow: hidden;
  }

  .value .title:not(:only-child) {
    border-left: 2px solid var(--border-color-override);
  }

  .dropdown.opened .title {
    transition-duration: 0.2s;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .dropdown:not(.opened) .title:hover {
    transition-duration: 0.2s;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .dropdown-menu {
    display: none;
    position: absolute;
    width: var(--width);
    padding: var(--padding);
    margin-top: 26px;
    margin-left: calc(100% - var(--width));
    flex-direction: column;
    font-size: 0.9rem;
    z-index: 9000;
    background-color: var(--base-color);
    border: 2px solid var(--border-color-override);
    border-radius: 5px;
    overflow: hidden;
    box-shadow:
      rgba(0, 0, 0, 0.19) 0px 10px 20px,
      rgba(0, 0, 0, 0.23) 0px 6px 8px;
  }

  .dropdown-menu.has-title {
    margin-top: calc(var(--height) + 0.1rem);
  }

  .dropdown.opened .dropdown-menu {
    display: flex;
  }
</style>
