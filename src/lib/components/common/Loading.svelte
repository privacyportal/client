<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { isDarkMode } from '$lib/stores/account';

  export let headerHeight = '50px';
  let animated = true;
</script>

<div id="loading" style:--header-height={headerHeight}>
  <Section height="100%" bgColor={$isDarkMode ? 'var(--outer-bg-color)' : 'var(--primary-color)'} color="var(--primary-text-color)" textCentered="true">
    <FlexContainer column gap="2rem" width="auto" color="inherit">
      <div>
        <Logo dimension="12rem" color="var(--primary-color)" opacity="1" {animated} />
        <h2>Privacy Portal</h2>
      </div>
    </FlexContainer>
  </Section>
</div>

<style>
  #loading {
    height: 100%;
  }
</style>
