<script>
  export let color = 'white';
  export let backgroundColor = 'grey';
  export let icon = undefined;
  export let gap = '0.15rem';
  export let margin = '0px';
  export let padding = '0.1rem 0.5rem';
  export let small = undefined;
</script>

<span style:--margin={margin} style:--padding={padding} style:--color={color} style:--bg-color={backgroundColor} style:--gap={gap} class:icon class="unselectable" class:small>
  <slot />
</span>

<style>
  span {
    display: inline-flex;
    align-items: center;
    gap: var(--gap);
    font-size: 0.8rem;
    margin: var(--margin);
    padding: var(--padding);
    border-radius: 15px;
    color: var(--color);
    background-color: var(--bg-color);
    transition-duration: 0.2s;
  }

  span.icon {
    padding-left: 0.1rem;
    padding-right: 0.3rem;
  }

  span.small {
    font-size: x-small;
  }
</style>
