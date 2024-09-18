<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import EditIcon from '$lib/components/materialIcons/EditIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { gotoPage } from '$lib/modules/routingUtils';
  import { minuteTimer } from '$lib/stores/timers';

  export let application;

  const SEVENTY_DAYS_AGO_MS = 6048000000;

  $: activeUsers = Object.entries(application?.active_users || {}).reduce((result, [timestampInSecs, count]) => {
    return timestampInSecs * 1000 >= $minuteTimer - SEVENTY_DAYS_AGO_MS ? Math.max(result, count) : result;
  }, 0);
</script>

<FlexContainer height="35px" bgColor="var(--new-layer-color)" width="auto" roundedIcon>
  {#if application.icon}
    <img alt="icon" src={`data:image/png;base64,${application.icon}`} />
  {:else}
    <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
  {/if}
</FlexContainer>
<FlexContainer column align_items="flex-start" gap="0.3rem">
  <h6 class="no-margin">{application.name}</h6>
  <span class="xs">{new URL(application.url).host}</span>
</FlexContainer>
<Tag><span class="xs">{activeUsers} Active Users</span></Tag>
<Button on:click={gotoPage(`/settings/applications/${application.id}`)} padding="2px 7px" blendin rounded><EditIcon dimension="20px" /></Button>
