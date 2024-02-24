<script>
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Loading from '$lib/components/common/Loading.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import sendRequest from '$lib/modules/sendRequest';
  import { session } from '$lib/stores/account';
  import { onMount } from 'svelte';

  // support hash params to prevent unwanted leaks to server
  const searchParams = $page.url.hash?.length ? new URLSearchParams($page.url?.hash.substring(1)) : $page.url.searchParams;
  let clientId = searchParams.get('client_id');
  let scope = searchParams.get('scope');
  let redirect_uri = searchParams.get('redirect_uri');
  let state = searchParams.get('state');
  let prompt = searchParams.get('prompt');

  let client_info;
  let authorized_data;
  let new_scope;
  let errorMessage;

  $: consent_scope = new_scope || scope;

  let name = 'Anonymous';
  let submitting = false;

  async function parseError(err) {
    try {
      return JSON.parse(err.message);
    } catch {
      return { status: 503 };
    }
  }

  async function cancelAuthorization() {
    redirectWithError({ error: 'access_denied', error_description: 'The user has denied your application access.' });
  }

  function redirectWithError({ error, error_description }) {
    if (client_info?.redirect_uri || error === 'interaction_required') {
      const url = new URL(client_info?.redirect_uri || redirect_uri);
      url.searchParams.append('error', error);
      url.searchParams.append('error_description', error_description);
      window.location.replace(url.toString());
    } else {
      errorMessage = {
        error,
        error_description
      };
    }
  }

  async function authorizeClient(consented = false) {
    try {
      const { data } = await sendRequest(
        {
          method: 'POST',
          path: '/oauth/authorize',
          data: {
            response_type: 'code',
            client_id: clientId,
            scope,
            ...(redirect_uri && { redirect_uri }),
            ...(consented &&
              name && {
                authorization: {
                  ...(scope.includes('name') && { name }),
                  ...(scope.includes('email') && { email: true })
                }
              }),
            ...(prompt && { prompt }),
            ...(state && { state })
          }
        },
        {
          fullError: true,
          ...(prompt === 'login' && { handleUnauthorized: () => redirectWithError({ error: 'login_required' }) })
        }
      );

      if (data.redirect_uri) return window.location.replace(data.redirect_uri);

      // display consent page
      client_info = data.client_info;
      authorized_data = data.authorized_data;
      new_scope = data.new_scope;
    } catch (err) {
      console.error(err);
      const { status, body } = await parseError(err);

      if (body?.error) {
        return redirectWithError({ error: body.error, error_description: body.error_description });
      } else if (status === 401) {
        return redirectWithError({ error: 'access_denied', error_description: 'The server has denied your application access.' });
      } else if (status === 503) {
        return redirectWithError({ error: 'temporarily_unavailable', error_description: 'The server is temporarily unavailable. Please try again later.' });
      }

      // catch-all error
      return redirectWithError({ error: 'server_error', error_description: 'The server has encountered an issue.' });
    }
  }

  onMount(async () => {
    if (clientId && scope) {
      await Promise.all([authorizeClient(false)]);
    }
  });
</script>

{#if client_info}
  <FlexContainer height="100%" align_items="center" justify_content="center">
    <FlexContainer column align_items="center" width="min(95vw, 600px)" gap="3rem">
      <h2 class="no-margin">Sign in with Privacy Portal</h2>

      <FlexContainer column align_items="center" gap="0.2rem">
        <FlexContainer height="100px" width="100px" bgColor="var(--new-layer-color)" roundedIcon>
          {#if client_info.icon}
            <img alt="icon" src={`data:image/png;base64,${client_info.icon}`} />
          {:else}
            <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
          {/if}
        </FlexContainer>
        <h4 class="no-margin">{client_info.name}</h4>
        <span class="xs">{client_info.url}</span>
      </FlexContainer>

      <FlexContainer width="min(100%, 350px)" textCentered>
        <h5 class="no-margin">Do you want to sign in to "{client_info.name}" with your Privacy Portal Account?</h5>
      </FlexContainer>

      <Form on:submit={() => authorizeClient(true)}>
        <FlexContainer column align_items="center" gap="3rem">
          {#if consent_scope.includes('name') || consent_scope.includes('email')}
            <GridContainer width="min(100%, 350px)" bgColor="var(--new-layer-color)" align_items="center" template_columns="auto 1fr" padding="1rem" gap="1rem" rounded>
              {#if consent_scope.includes('name')}
                <h5 class="no-margin">Name</h5>
                <Input type="text" name="name" placeholder="name" autocomplete="off" minlength="1" maxlength="100" required focus bind:value={name} disabled={submitting} />
              {:else if authorized_data?.name}
                <h5 class="no-margin disabled">Name</h5>
                <span class="disabled">{authorized_data.name}</span>
              {/if}
              {#if consent_scope.includes('email')}
                <h5 class="no-margin">Email</h5>
                <FlexContainer column>
                  <span class="sm">New Privacy Address</span>
                  <span class="xs">Forwards to: {$session.email}</span>
                </FlexContainer>
              {:else if authorized_data?.email}
                <h5 class="no-margin disabled">Email</h5>
                <FlexContainer column>
                  <span class="sm disabled">{authorized_data.email}</span>
                  <span class="xs disabled">Forwards to: {$session.email}</span>
                </FlexContainer>
              {/if}
            </GridContainer>
          {/if}

          <GridContainer width="min(100%, 350px)" template_columns="1fr 1fr" gap="0.5rem">
            <Button on:click={cancelAuthorization} width="100%" disabled={submitting} rounded border>Cancel</Button>
            <Button type="submit" width="100%" disabled={submitting} primary rounded>Continue</Button>
          </GridContainer>
        </FlexContainer>
      </Form>
    </FlexContainer>
  </FlexContainer>
{:else if !clientId || !scope}
  <FlexContainer padding="20% 0" column align_items="center" textCentered>
    <Logo dimension="15%" color="#b08d00" opacity="1" />
    <h2>OAUTH Error</h2>
    <span>missing client_id or scope</span>
  </FlexContainer>
{:else if errorMessage}
  <FlexContainer padding="20% 0" column align_items="center" textCentered>
    <Logo dimension="15%" color="#b08d00" opacity="1" />
    <h2>OAUTH Error</h2>
    <span>{errorMessage.error}</span>
    {#if errorMessage?.error_description}
      <span class="xs">{errorMessage.error_description}</span>
    {/if}
  </FlexContainer>
{:else}
  <Loading />
{/if}

<style>
  h5.disabled,
  span.disabled {
    filter: brightness(90%);
  }
</style>
