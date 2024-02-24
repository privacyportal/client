<script>
  import GridContainer from '$lib/components/common/GridContainer.svelte';

  export let nodes = [{ text: 'step 1' }, { text: 'step 2' }, { text: 'step 3' }, { text: 'step 4' }];
  export let progressIndex = 0;
</script>

<GridContainer width="100%" padding="0.5rem 0 0 0" align_items="center" justify_items="center" template_columns={'1fr ' + nodes.map((_) => '15px').join(' 1fr 1fr ') + ' 1fr'} template_rows="15px 1fr">
  <span />
  {#each nodes as _, index}
    <hr class="node" class:checked={progressIndex > index} class:selected={progressIndex === index} />
    {#if index < nodes.length - 1}
      <hr class="link" />
      <hr class="link" />
    {/if}
  {/each}
  <span />
  {#each nodes as node, index}
    <span style={`grid-column: ${index * 3 + 1} / span 3;`} class:selected={progressIndex === index}>{node.text}</span>
  {/each}
</GridContainer>

<style>
  .node {
    height: 100%;
    width: 100%;
    border: none;
    background: radial-gradient(ellipse at center, transparent 0% 45%, var(--dark-border-color) 45% 70%, transparent 70% 100%);
  }

  .node.checked {
    background: radial-gradient(ellipse at center, var(--primary-color) 0% 20%, transparent 40% 45%, var(--dark-border-color) 45% 70%, transparent 70% 100%);
  }

  .node.selected {
    border-width: 0px;
    border-radius: 50px;
    box-shadow: 0 0 5px 1px var(--primary-color);
    background: radial-gradient(ellipse at center, transparent 0% 45%, var(--primary-color) 45% 70%, transparent 70% 100%);
  }

  span {
    font-size: x-small;
    padding: 0.3rem 0 0 0;
  }

  span.selected {
    font-weight: 600;
  }

  .link {
    height: 100%;
    width: 100%;
    border: none;
    background: linear-gradient(0deg, transparent 0% 40%, var(--dark-border-color) 40% 60%, transparent 60% 100%);
  }
</style>
