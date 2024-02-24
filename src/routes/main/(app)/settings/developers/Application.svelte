<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import EditIcon from '$lib/components/materialIcons/EditIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { gotoPage } from '$lib/modules/routingUtils';

  export let application;
</script>

<FlexContainer height="35px" bgColor="var(--new-layer-color)" width="auto" roundedIcon>
  {#if application.icon}
    <img alt="icon" src={`data:image/png;base64,${application.icon}`} />
  {:else}
    <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
  {/if}
</FlexContainer>
<FlexContainer column gap="0.3rem">
  <h6 class="no-margin">{application.name}</h6>
  <span class="xs">{new URL(application.url).host}</span>
</FlexContainer>
<Button on:click={gotoPage(`/settings/applications/${application.id}`)} padding="2px 7px" blendin rounded><EditIcon dimension="20px" /></Button>
