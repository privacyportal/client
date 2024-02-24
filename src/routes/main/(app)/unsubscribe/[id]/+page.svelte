<script>
  import { page } from '$app/stores';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Loading from '$lib/components/common/Loading.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { deactivateEmailSubscription } from '$lib/modules/requests';
  import { onMount } from 'svelte';

  let succeeded;
  let errorMessage;
  const token = ($page.url.hash?.length ? new URLSearchParams($page.url?.hash.substring(1)) : $page.url.searchParams).get('t');

  async function unsubscribe() {
    try {
      if (!token) throw new Error('Token Required');
      await deactivateEmailSubscription($page.params.id, {
        displayError: false,
        accessToken: token,
        handleUnauthorized: () => {
          throw new Error('Email may be too old.');
        }
      });
      succeeded = true;
    } catch (err) {
      errorMessage = err.message;
    }
  }

  onMount(unsubscribe);
</script>

{#if succeeded}
  <FlexContainer padding="20% 0" column align_items="center" textCentered>
    <Logo dimension="15%" color="var(--primary-color)" opacity="1" />
    <h2>Successfully Unsubscribed</h2>
    <span class="sm">You have been successfully unsubscribed from this mailing list. You can configure all your email subscriptions on your <a href="/account">account page</a>.</span>
  </FlexContainer>
{:else if errorMessage}
  <FlexContainer padding="20% 0" column align_items="center" textCentered>
    <Logo dimension="15%" color="#b08d00" opacity="1" />
    <h2>Failed to Unsubscribe</h2>
    <span class="sm">{errorMessage || 'token required'}</span>
  </FlexContainer>
{:else}
  <Loading />
{/if}
