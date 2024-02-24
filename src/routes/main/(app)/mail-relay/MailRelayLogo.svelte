<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';

  export let color = 'var(--primary-color)';
</script>

<FlexContainer column textCentered gap="0.25rem">
  <span>
    <Logo dimension="150" {color} opacity={'1'} />
  </span>
  <h2>Mail Relay</h2>
  <h5>by Privacy Portal</h5>
</FlexContainer>

<style>
  h2,
  h5 {
    margin: 0px;
  }
</style>
